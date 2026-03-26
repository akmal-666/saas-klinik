import {
  Injectable, NotFoundException, BadRequestException,
  Inject, Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';
import { PaymentMethod, PaymentStatus, InvoiceStatus } from '@klinik/shared-types';
import {
  CreateInvoiceDto, AddPaymentDto, ApplyVoucherDto,
  DepositTopUpDto, InvoiceQueryDto,
} from './dto/kasir.dto';

@Injectable()
export class KasirService {
  private readonly logger = new Logger(KasirService.name);

  constructor(@Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient) {}

  // ─── LIST INVOICES ──────────────────────────────────────
  async listInvoices(clinic_id: string, query: InvoiceQueryDto) {
    const limit = Math.min(query.limit ?? 30, 100);
    let q = this.sb
      .from('invoices')
      .select(`
        id, invoice_number, status, subtotal, discount_amount,
        tax_amount, total, notes, created_at,
        patient:patients(id, rm_number, full_name, phone),
        payments(id, method, amount, status, paid_at)
      `)
      .eq('clinic_id', clinic_id)
      .order('created_at', { ascending: false });

    if (query.patient_id) q = q.eq('patient_id', query.patient_id);
    if (query.status)     q = q.eq('status', query.status);
    if (query.date_from)  q = q.gte('created_at', query.date_from);
    if (query.date_to)    q = q.lte('created_at', query.date_to + 'T23:59:59');
    if (query.cursor)     q = q.lt('created_at', query.cursor);
    q = q.limit(limit + 1);

    const { data, error } = await q;
    if (error) throw new BadRequestException(error.message);

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;
    return {
      data: items,
      meta: { next_cursor: hasMore ? items.at(-1)?.created_at : null, has_more: hasMore, total: items.length, limit },
    };
  }

  // ─── GET ONE INVOICE ────────────────────────────────────
  async getInvoice(clinic_id: string, id: string) {
    const { data, error } = await this.sb
      .from('invoices')
      .select(`
        *,
        patient:patients(*),
        payments(*),
        promo:promotions(id, code, name, discount_type, discount_value)
      `)
      .eq('id', id).eq('clinic_id', clinic_id).single();
    if (error || !data) throw new NotFoundException('Invoice tidak ditemukan');
    return data;
  }

  // ─── CREATE INVOICE ─────────────────────────────────────
  async createInvoice(clinic_id: string, dto: CreateInvoiceDto, created_by: string) {
    // Validate patient
    const { data: patient } = await this.sb.from('patients').select('id').eq('id', dto.patient_id).eq('clinic_id', clinic_id).single();
    if (!patient) throw new BadRequestException('Pasien tidak ditemukan');

    // Calculate totals
    const items = dto.items.map((item) => ({
      ...item,
      total: item.quantity * item.unit_price,
    }));
    const subtotal = items.reduce((s, i) => s + i.total, 0);

    // Resolve promo / voucher
    let discount_amount = dto.discount_amount ?? 0;
    let promo_id: string | null = dto.promo_id ?? null;

    if (dto.promo_code && !promo_id) {
      const resolved = await this.resolvePromo(clinic_id, dto.promo_code, subtotal);
      discount_amount = resolved.discount;
      promo_id = resolved.promo_id;
    }

    const tax_amount = 0; // configurable per klinik
    const total = Math.max(0, subtotal - discount_amount + tax_amount);

    const { data: inv, error } = await this.sb
      .from('invoices')
      .insert({
        clinic_id,
        patient_id:      dto.patient_id,
        appointment_id:  dto.appointment_id ?? null,
        emr_id:          dto.emr_id ?? null,
        items,
        subtotal, discount_amount, promo_id, tax_amount, total,
        status:          InvoiceStatus.ISSUED,
        notes:           dto.notes ?? null,
        created_by,
      })
      .select().single();

    if (error) throw new BadRequestException(error.message);
    this.logger.log(`Invoice created: ${inv.invoice_number}`);
    return inv;
  }

  // ─── ADD PAYMENT ────────────────────────────────────────
  async addPayment(clinic_id: string, invoice_id: string, dto: AddPaymentDto, created_by: string) {
    const inv = await this.getInvoice(clinic_id, invoice_id);
    if (inv.status === InvoiceStatus.PAID) throw new BadRequestException('Invoice sudah lunas');
    if (inv.status === InvoiceStatus.CANCELLED) throw new BadRequestException('Invoice sudah dibatalkan');

    // Handle deposit payment
    if (dto.method === PaymentMethod.DEPOSIT) {
      const balance = await this.getDepositBalance(clinic_id, inv.patient_id);
      if (balance < dto.amount) throw new BadRequestException(`Saldo deposit tidak cukup. Saldo: Rp ${balance.toLocaleString('id-ID')}`);
      // Deduct deposit
      await this.sb.from('deposits').insert({
        clinic_id, patient_id: inv.patient_id,
        amount: -dto.amount,
        balance_after: balance - dto.amount,
        invoice_id,
        notes: `Pembayaran invoice ${inv.invoice_number}`,
        created_by,
      });
    }

    // Insert payment record
    const { data: payment, error } = await this.sb
      .from('payments')
      .insert({
        clinic_id, invoice_id,
        method:                 dto.method,
        amount:                 dto.amount,
        reference_number:       dto.reference_number ?? null,
        insurance_id:           dto.insurance_id ?? null,
        insurance_claim_number: dto.insurance_claim_number ?? null,
        status:                 PaymentStatus.PAID,
        paid_at:                new Date().toISOString(),
        notes:                  dto.notes ?? null,
        created_by,
      })
      .select().single();

    if (error) throw new BadRequestException(error.message);

    // Recalculate invoice status
    await this.reconcileInvoiceStatus(clinic_id, invoice_id);
    return payment;
  }

  // ─── APPLY VOUCHER ──────────────────────────────────────
  async applyVoucher(clinic_id: string, invoice_id: string, dto: ApplyVoucherDto) {
    const inv = await this.getInvoice(clinic_id, invoice_id);
    const { discount, promo_id, promo_name } = await this.resolvePromo(clinic_id, dto.code, inv.subtotal);

    const { data, error } = await this.sb
      .from('invoices')
      .update({
        discount_amount: discount,
        promo_id,
        total: Math.max(0, inv.subtotal - discount + inv.tax_amount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice_id).eq('clinic_id', clinic_id).select().single();

    if (error) throw new BadRequestException(error.message);
    return { ...data, promo_applied: promo_name, discount_applied: discount };
  }

  // ─── VOID / CANCEL ──────────────────────────────────────
  async voidInvoice(clinic_id: string, id: string, reason: string) {
    const inv = await this.getInvoice(clinic_id, id);
    if (inv.status === InvoiceStatus.PAID) throw new BadRequestException('Invoice yang sudah lunas tidak dapat dibatalkan. Gunakan refund.');

    const { data, error } = await this.sb
      .from('invoices')
      .update({ status: InvoiceStatus.CANCELLED, notes: `[VOID] ${reason}`, updated_at: new Date().toISOString() })
      .eq('id', id).eq('clinic_id', clinic_id).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─── DEPOSIT: get balance ────────────────────────────────
  async getDepositBalance(clinic_id: string, patient_id: string): Promise<number> {
    const { data } = await this.sb
      .from('deposits')
      .select('amount')
      .eq('patient_id', patient_id);
    return (data ?? []).reduce((s, d) => s + d.amount, 0);
  }

  // ─── DEPOSIT: top-up ─────────────────────────────────────
  async topUpDeposit(clinic_id: string, dto: DepositTopUpDto, created_by: string) {
    const { data: patient } = await this.sb.from('patients').select('id').eq('id', dto.patient_id).eq('clinic_id', clinic_id).single();
    if (!patient) throw new BadRequestException('Pasien tidak ditemukan');

    const balance = await this.getDepositBalance(clinic_id, dto.patient_id);
    const newBalance = balance + dto.amount;

    const { data, error } = await this.sb.from('deposits').insert({
      clinic_id, patient_id: dto.patient_id,
      amount:        dto.amount,
      balance_after: newBalance,
      notes:         dto.notes ?? `Top-up deposit`,
      created_by,
    }).select().single();

    if (error) throw new BadRequestException(error.message);
    this.logger.log(`Deposit top-up: patient ${dto.patient_id} +${dto.amount}`);
    return { ...data, new_balance: newBalance };
  }

  // ─── DEPOSIT: history ────────────────────────────────────
  async getDepositHistory(clinic_id: string, patient_id: string) {
    const { data: patient } = await this.sb.from('patients').select('id,full_name,rm_number').eq('id', patient_id).eq('clinic_id', clinic_id).single();
    if (!patient) throw new NotFoundException('Pasien tidak ditemukan');

    const { data } = await this.sb
      .from('deposits')
      .select('*')
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false });

    const balance = await this.getDepositBalance(clinic_id, patient_id);
    return { patient, transactions: data ?? [], current_balance: balance };
  }

  // ─── DAILY REPORT ────────────────────────────────────────
  async getDailySummary(clinic_id: string, date: string) {
    const { data: invoices } = await this.sb
      .from('invoices')
      .select('id, total, status')
      .eq('clinic_id', clinic_id)
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    const { data: payments } = await this.sb
      .from('payments')
      .select('method, amount, status')
      .eq('clinic_id', clinic_id)
      .gte('paid_at', `${date}T00:00:00`)
      .lte('paid_at', `${date}T23:59:59`);

    const total_invoice = (invoices ?? []).reduce((s, i) => s + i.total, 0);
    const total_paid = (payments ?? []).filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

    const by_method = (payments ?? []).reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + p.amount;
      return acc;
    }, {});

    return {
      date,
      total_invoices: (invoices ?? []).length,
      total_invoice_amount: total_invoice,
      total_paid,
      total_outstanding: total_invoice - total_paid,
      by_payment_method: by_method,
      invoices_by_status: {
        issued:    (invoices ?? []).filter((i) => i.status === 'issued').length,
        paid:      (invoices ?? []).filter((i) => i.status === 'paid').length,
        partial:   (invoices ?? []).filter((i) => i.status === 'partial').length,
        cancelled: (invoices ?? []).filter((i) => i.status === 'cancelled').length,
      },
    };
  }

  // ─── HELPERS ────────────────────────────────────────────
  private async resolvePromo(clinic_id: string, code: string, subtotal: number) {
    const { data: promo } = await this.sb
      .from('promotions')
      .select('*')
      .eq('clinic_id', clinic_id)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString().split('T')[0])
      .gte('valid_until', new Date().toISOString().split('T')[0])
      .single();

    if (!promo) throw new BadRequestException(`Kode promo "${code}" tidak valid atau sudah kadaluarsa`);
    if (promo.min_transaction > subtotal) throw new BadRequestException(`Minimum transaksi Rp ${promo.min_transaction.toLocaleString('id-ID')}`);
    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) throw new BadRequestException('Kuota promo sudah habis');

    let discount = promo.discount_type === 'percentage'
      ? (subtotal * promo.discount_value) / 100
      : promo.discount_value;

    if (promo.max_discount) discount = Math.min(discount, promo.max_discount);

    // Increment usage
    await this.sb.from('promotions').update({ usage_count: promo.usage_count + 1 }).eq('id', promo.id);

    return { discount, promo_id: promo.id, promo_name: promo.name };
  }

  private async reconcileInvoiceStatus(clinic_id: string, invoice_id: string) {
    const { data: inv } = await this.sb.from('invoices').select('total').eq('id', invoice_id).single();
    const { data: payments } = await this.sb.from('payments').select('amount').eq('invoice_id', invoice_id).eq('status', 'paid');
    const paid = (payments ?? []).reduce((s, p) => s + p.amount, 0);
    const total = inv?.total ?? 0;
    const status = paid >= total ? InvoiceStatus.PAID : paid > 0 ? InvoiceStatus.PARTIAL : InvoiceStatus.ISSUED;
    await this.sb.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', invoice_id);
  }
}
