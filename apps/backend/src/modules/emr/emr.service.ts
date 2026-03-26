import {
  Injectable, NotFoundException, BadRequestException,
  Inject, Logger, ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@klinik/shared-types';
import {
  CreateEmrDto, UpdateEmrDto, EmrQueryDto, SignConsentDto,
} from './dto/emr.dto';
import { ICD10_DENTAL, ICD9_DENTAL } from '@klinik/shared-constants';

@Injectable()
export class EmrService {
  private readonly logger = new Logger(EmrService.name);

  constructor(
    @Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient,
  ) {}

  // ─── LIST (riwayat kunjungan pasien) ────────────────────
  async findAll(clinic_id: string, query: EmrQueryDto, actor: JwtPayload) {
    const limit = Math.min(query.limit ?? 20, 100);

    let q = this.sb
      .from('emr_records')
      .select(`
        id, visit_date, soap, icd10_codes, icd9_codes, notes,
        consent_signed, satusehat_status, created_at,
        patient:patients(id, rm_number, full_name, date_of_birth, gender, phone, allergy),
        doctor:doctors(id, name, specialization)
      `)
      .eq('clinic_id', clinic_id)
      .order('visit_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Dokter hanya lihat EMR mereka sendiri
    if (actor.role === UserRole.DOKTER) {
      const { data: doc } = await this.sb
        .from('doctors')
        .select('id')
        .eq('user_id', actor.sub)
        .single();
      if (doc) q = q.eq('doctor_id', doc.id);
    }

    if (query.patient_id) q = q.eq('patient_id', query.patient_id);
    if (query.doctor_id && actor.role !== UserRole.DOKTER) q = q.eq('doctor_id', query.doctor_id);
    if (query.date_from) q = q.gte('visit_date', query.date_from);
    if (query.date_to)   q = q.lte('visit_date', query.date_to);

    if (query.cursor) q = q.lt('created_at', query.cursor);
    q = q.limit(limit + 1);

    const { data, error } = await q;
    if (error) throw new BadRequestException(error.message);

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;

    return {
      data: items,
      meta: {
        cursor: query.cursor ?? null,
        next_cursor: hasMore ? items[items.length - 1].created_at : null,
        total: items.length,
        limit,
        has_more: hasMore,
      },
    };
  }

  // ─── FIND ONE ───────────────────────────────────────────
  async findOne(clinic_id: string, id: string, actor: JwtPayload) {
    const { data, error } = await this.sb
      .from('emr_records')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        attachments:emr_attachments(id, type, file_name, file_url, file_size, created_at),
        treatments:emr_treatments(treatment:treatments(*))
      `)
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .single();

    if (error || !data) throw new NotFoundException('EMR tidak ditemukan');

    // Dokter hanya boleh akses EMR miliknya
    if (actor.role === UserRole.DOKTER) {
      const { data: doc } = await this.sb
        .from('doctors').select('id').eq('user_id', actor.sub).single();
      if (!doc || data.doctor_id !== doc.id) throw new ForbiddenException('Akses ditolak');
    }

    return {
      ...data,
      treatments: (data.treatments || []).map((t: any) => t.treatment),
    };
  }

  // ─── CREATE ─────────────────────────────────────────────
  async create(clinic_id: string, dto: CreateEmrDto, actor: JwtPayload) {
    // Validate patient & doctor belong to clinic
    await this.validateBelongsToClinic('patients', dto.patient_id, clinic_id);
    await this.validateBelongsToClinic('doctors', dto.doctor_id, clinic_id);

    // If linked to appointment, mark it as completed
    if (dto.appointment_id) {
      await this.sb
        .from('appointments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', dto.appointment_id)
        .eq('clinic_id', clinic_id);
    }

    // Insert EMR record
    const { data: emr, error } = await this.sb
      .from('emr_records')
      .insert({
        clinic_id,
        appointment_id:  dto.appointment_id ?? null,
        patient_id:      dto.patient_id,
        doctor_id:       dto.doctor_id,
        visit_date:      dto.visit_date,
        soap:            dto.soap,
        vitals:          dto.vitals ?? {},
        icd10_codes:     dto.icd10_codes ?? [],
        icd9_codes:      dto.icd9_codes ?? [],
        notes:           dto.notes ?? null,
        consent_signed:  dto.consent_signed ?? false,
        satusehat_status:'pending',
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Link treatments
    if (dto.treatment_ids?.length) {
      await this.sb.from('emr_treatments').insert(
        dto.treatment_ids.map((tid) => ({ emr_id: emr.id, treatment_id: tid })),
      );
    }

    // Queue SATUSEHAT sync (fire and forget)
    this.queueSatuSehatSync(emr.id, clinic_id).catch((e) =>
      this.logger.warn(`SATUSEHAT queue failed: ${e.message}`),
    );

    this.logger.log(`EMR created: ${emr.id} — patient ${dto.patient_id}`);
    return emr;
  }

  // ─── UPDATE ─────────────────────────────────────────────
  async update(clinic_id: string, id: string, dto: UpdateEmrDto, actor: JwtPayload) {
    await this.findOne(clinic_id, id, actor); // validates access

    const { data, error } = await this.sb
      .from('emr_records')
      .update({
        ...(dto.soap        && { soap: dto.soap }),
        ...(dto.vitals      && { vitals: dto.vitals }),
        ...(dto.icd10_codes && { icd10_codes: dto.icd10_codes }),
        ...(dto.icd9_codes  && { icd9_codes: dto.icd9_codes }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.consent_signed !== undefined && { consent_signed: dto.consent_signed }),
        satusehat_status: 'pending', // re-queue sync on update
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Re-link treatments if provided
    if (dto.treatment_ids) {
      await this.sb.from('emr_treatments').delete().eq('emr_id', id);
      if (dto.treatment_ids.length) {
        await this.sb.from('emr_treatments').insert(
          dto.treatment_ids.map((tid) => ({ emr_id: id, treatment_id: tid })),
        );
      }
    }

    return data;
  }

  // ─── SIGN CONSENT ───────────────────────────────────────
  async signConsent(clinic_id: string, id: string, dto: SignConsentDto, actor: JwtPayload) {
    await this.findOne(clinic_id, id, actor);

    // Store signature metadata (actual base64 should go to storage in prod)
    const consentData = {
      signed_by:    actor.name,
      signer_name:  dto.signer_name ?? actor.name,
      signer_relation: dto.signer_relation ?? 'Pasien',
      signature_ref: `consent/${id}/signature.png`, // storage path
      signed_at:    new Date().toISOString(),
      ip_address:   null,
    };

    const { data, error } = await this.sb
      .from('emr_records')
      .update({
        consent_signed:   true,
        consent_signed_at:new Date().toISOString(),
        consent_data:     consentData,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    this.logger.log(`Consent signed for EMR: ${id}`);
    return data;
  }

  // ─── PATIENT HISTORY (timeline) ─────────────────────────
  async getPatientHistory(clinic_id: string, patient_id: string) {
    const { data: patient, error: pe } = await this.sb
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .eq('clinic_id', clinic_id)
      .single();

    if (pe || !patient) throw new NotFoundException('Pasien tidak ditemukan');

    const { data: visits } = await this.sb
      .from('emr_records')
      .select(`
        id, visit_date, icd10_codes, icd9_codes, consent_signed,
        satusehat_status, created_at,
        doctor:doctors(id, name, specialization),
        treatments:emr_treatments(treatment:treatments(id, name, category, price))
      `)
      .eq('patient_id', patient_id)
      .eq('clinic_id', clinic_id)
      .order('visit_date', { ascending: false });

    const { data: deposit } = await this.sb
      .rpc('get_patient_deposit_balance', { p_patient_id: patient_id })
      .single();

    return {
      patient,
      visits: (visits || []).map((v) => ({
        ...v,
        treatments: (v.treatments || []).map((t: any) => t.treatment),
      })),
      deposit_balance: (deposit as any)?.balance ?? 0,
      total_visits: visits?.length ?? 0,
    };
  }

  // ─── ICD SEARCH ─────────────────────────────────────────
  async searchIcd10(q: string, category?: string) {
    // Primary: query icd10_codes table (seeded via migration 002)
    try {
      let dbq = this.sb
        .from('icd10_codes')
        .select('code,description,category,billable,notes')
        .order('code')
        .limit(50);
      if (q)        dbq = dbq.ilike('description', `%${q}%`);
      if (category) dbq = dbq.eq('category', category);
      const { data, error } = await dbq;
      if (!error && data && data.length > 0) return data;
    } catch (_) { /* fallback below */ }

    // Fallback: filter the in-memory ICD10_DENTAL array (imported via tsconfig paths)
    const qLower = (q ?? '').toLowerCase();
    return ICD10_DENTAL
      .filter(i =>
        i.billable &&
        (!qLower || i.code.toLowerCase().includes(qLower) || i.description.toLowerCase().includes(qLower)) &&
        (!category || i.category === category),
      )
      .slice(0, 50);
  }

  async searchIcd9(q: string, category?: string) {
    try {
      let dbq = this.sb
        .from('icd9_codes')
        .select('code,description,category,billable')
        .order('code')
        .limit(50);
      if (q)        dbq = dbq.ilike('description', `%${q}%`);
      if (category) dbq = dbq.eq('category', category);
      const { data, error } = await dbq;
      if (!error && data && data.length > 0) return data;
    } catch (_) { /* fallback below */ }

    const qLower = (q ?? '').toLowerCase();
    return ICD9_DENTAL
      .filter(i =>
        (!qLower || i.code.toLowerCase().includes(qLower) || i.description.toLowerCase().includes(qLower)) &&
        (!category || i.category === category),
      )
      .slice(0, 50);
  }

  // ─── HELPERS ────────────────────────────────────────────
  private async validateBelongsToClinic(table: string, id: string, clinic_id: string) {
    const { data } = await this.sb
      .from(table).select('id').eq('id', id).eq('clinic_id', clinic_id).single();
    if (!data) throw new BadRequestException(`${table} tidak ditemukan di klinik ini`);
  }

  private async queueSatuSehatSync(emrId: string, clinicId: string) {
    // In prod: enqueue to BullMQ
    // await this.satuSehatQueue.add('sync-emr', { emrId, clinicId }, { attempts: 3, backoff: { type:'exponential', delay:5000 } });
    this.logger.log(`[SATUSEHAT] Queued sync for EMR: ${emrId}`);
  }
}
