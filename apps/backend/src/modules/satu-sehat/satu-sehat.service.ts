import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';

/**
 * SatuSehatService — integrasi FHIR R4 dengan platform SATUSEHAT Kemenkes RI
 *
 * Endpoint: https://api-satusehat.kemkes.go.id/fhir-r4/v1
 * Docs: https://satusehat.kemkes.go.id/platform/docs/id
 *
 * Resources yang diimplementasi:
 *  - Patient       (sync data pasien)
 *  - Practitioner  (sync data dokter)
 *  - Organization  (data klinik)
 *  - Encounter     (kunjungan / EMR)
 *  - Condition     (ICD-10 diagnosa)
 *  - Procedure     (ICD-9 tindakan)
 *  - Observation   (vitals)
 */
@Injectable()
export class SatuSehatService {
  private readonly logger = new Logger(SatuSehatService.name);
  private tokenCache: { token: string; expires: number } | null = null;

  constructor(
    @Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient,
    private readonly config: ConfigService,
  ) {}

  // ─── Get OAuth2 token ────────────────────────────────────
  private async getAccessToken(clientId: string, clientSecret: string): Promise<string> {
    if (this.tokenCache && this.tokenCache.expires > Date.now()) {
      return this.tokenCache.token;
    }

    const baseUrl = this.config.get('SATUSEHAT_BASE_URL', 'https://api-satusehat.kemkes.go.id');
    const res = await fetch(`${baseUrl}/oauth2/v1/accesstoken?grant_type=client_credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
    });

    if (!res.ok) throw new Error(`SATUSEHAT auth failed: ${res.status}`);
    const data = await res.json();
    this.tokenCache = {
      token:   data.access_token,
      expires: Date.now() + (data.expires_in - 60) * 1000,
    };
    return data.access_token;
  }

  // ─── Sync EMR record ─────────────────────────────────────
  async syncEmr(emr_id: string, clinic_id: string): Promise<void> {
    // 1. Get clinic SATUSEHAT config
    const { data: clinic } = await this.sb.from('clinics')
      .select('satusehat_org_id, satusehat_client_id, satusehat_client_secret, satusehat_enabled')
      .eq('id', clinic_id).single();

    if (!clinic?.satusehat_enabled || !clinic.satusehat_org_id) {
      this.logger.warn(`SATUSEHAT not enabled for clinic ${clinic_id}`);
      return;
    }

    // 2. Get EMR with relations
    const { data: emr } = await this.sb.from('emr_records')
      .select('*, patient:patients(id,full_name,date_of_birth,gender), doctor:doctors(id,name,sip_number)')
      .eq('id', emr_id).single();

    if (!emr) { this.logger.warn(`EMR ${emr_id} not found`); return; }

    try {
      const token = await this.getAccessToken(clinic.satusehat_client_id, clinic.satusehat_client_secret);
      const bundle = this.buildFhirBundle(emr, clinic);
      await this.postBundle(bundle, token, clinic.satusehat_org_id);

      // Mark as synced
      await this.sb.from('emr_records').update({
        satusehat_status: 'synced',
        satusehat_synced_at: new Date().toISOString(),
      }).eq('id', emr_id);

      this.logger.log(`SATUSEHAT sync OK: EMR ${emr_id}`);
    } catch (err: any) {
      this.logger.error(`SATUSEHAT sync FAILED: EMR ${emr_id} — ${err.message}`);
      await this.sb.from('emr_records').update({ satusehat_status: 'failed' }).eq('id', emr_id);
      throw err; // Let BullMQ handle retry
    }
  }

  // ─── Build FHIR R4 Bundle ────────────────────────────────
  private buildFhirBundle(emr: any, clinic: any): object {
    const patient   = emr.patient;
    const doctor    = emr.doctor;
    const visitDate = emr.visit_date;
    const baseUrl   = 'https://api-satusehat.kemkes.go.id/fhir-r4/v1';
    const orgId     = clinic.satusehat_org_id;

    // FHIR Encounter resource
    const encounter = {
      resourceType: 'Encounter',
      id: `encounter-${emr.id}`,
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'Ambulatory',
      },
      subject: {
        reference: `Patient/${patient.id}`,
        display: patient.full_name,
      },
      participant: [{
        individual: {
          reference: `Practitioner/${doctor.id}`,
          display: doctor.name,
        },
      }],
      period: {
        start: `${visitDate}T00:00:00+07:00`,
        end:   `${visitDate}T23:59:59+07:00`,
      },
      serviceProvider: {
        reference: `Organization/${orgId}`,
      },
    };

    // FHIR Condition resources (ICD-10)
    const conditions = (emr.icd10_codes || []).map((code: string, i: number) => ({
      resourceType: 'Condition',
      id: `condition-${emr.id}-${i}`,
      clinicalStatus: {
        coding: [{ system:'http://terminology.hl7.org/CodeSystem/condition-clinical', code:'active' }],
      },
      code: {
        coding: [{
          system: 'http://hl7.org/fhir/sid/icd-10',
          code,
        }],
      },
      subject: { reference: `Patient/${patient.id}` },
      encounter: { reference: `Encounter/encounter-${emr.id}` },
    }));

    // FHIR Procedure resources (ICD-9)
    const procedures = (emr.icd9_codes || []).map((code: string, i: number) => ({
      resourceType: 'Procedure',
      id: `procedure-${emr.id}-${i}`,
      status: 'completed',
      code: {
        coding: [{
          system: 'http://hl7.org/fhir/sid/icd-9-cm',
          code,
        }],
      },
      subject: { reference: `Patient/${patient.id}` },
      encounter: { reference: `Encounter/encounter-${emr.id}` },
    }));

    // FHIR Observation — vitals
    const observations: any[] = [];
    if (emr.vitals?.blood_pressure) {
      observations.push({
        resourceType: 'Observation',
        id: `obs-bp-${emr.id}`,
        status: 'final',
        code: {
          coding: [{ system:'http://loinc.org', code:'55284-4', display:'Blood pressure' }],
        },
        subject: { reference: `Patient/${patient.id}` },
        encounter: { reference: `Encounter/encounter-${emr.id}` },
        valueString: emr.vitals.blood_pressure,
      });
    }

    return {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        { resource: encounter,    request: { method:'POST', url:'Encounter' } },
        ...conditions.map((c: any) => ({ resource: c, request: { method:'POST', url:'Condition' } })),
        ...procedures.map((p: any) => ({ resource: p, request: { method:'POST', url:'Procedure' } })),
        ...observations.map((o: any) => ({ resource: o, request: { method:'POST', url:'Observation' } })),
      ],
    };
  }

  // ─── POST bundle to SATUSEHAT API ────────────────────────
  private async postBundle(bundle: object, token: string, orgId: string): Promise<void> {
    const baseUrl = this.config.get('SATUSEHAT_BASE_URL', 'https://api-satusehat.kemkes.go.id');
    const res = await fetch(`${baseUrl}/fhir-r4/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Organization-ID': orgId,
      },
      body: JSON.stringify(bundle),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`SATUSEHAT API error ${res.status}: ${body}`);
    }
  }

  // ─── Sync pending EMRs (called by scheduler) ─────────────
  async syncPendingBatch(limit = 10): Promise<{ synced: number; failed: number }> {
    const { data: pending } = await this.sb
      .from('satusehat_pending') // view defined in migration 002
      .select('id, clinic_id')
      .limit(limit);

    let synced = 0, failed = 0;
    for (const row of pending ?? []) {
      try {
        await this.syncEmr(row.id, row.clinic_id);
        synced++;
      } catch {
        failed++;
      }
    }

    this.logger.log(`SATUSEHAT batch: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }
}
