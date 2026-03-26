"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvoiceHtml = buildInvoiceHtml;
exports.buildPayrollSlipHtml = buildPayrollSlipHtml;
function buildInvoiceHtml(invoice) {
    const fmt = (n) => 'Rp ' + n.toLocaleString('id-ID');
    const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
    const remaining = invoice.total - totalPaid;
    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,sans-serif; font-size:12px; color:#1f2937; padding:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:24px; border-bottom:2px solid #0f1d35; }
  .clinic-name { font-size:22px; font-weight:800; color:#0f1d35; }
  .clinic-sub { font-size:11px; color:#6b7280; margin-top:2px; }
  .invoice-title { font-size:14px; font-weight:700; color:#0f1d35; text-align:right; }
  .invoice-number { font-size:18px; font-weight:800; color:#2563eb; font-family:monospace; }
  .section { margin-bottom:20px; }
  .section-title { font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .info-item label { display:block; font-size:10px; color:#6b7280; margin-bottom:2px; }
  .info-item span { font-weight:600; font-size:12px; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead th { background:#f8fafc; padding:9px 12px; text-align:left; font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #e5e7eb; }
  tbody td { padding:10px 12px; border-bottom:1px solid #f1f5f9; font-size:12px; vertical-align:top; }
  .text-right { text-align:right; }
  .total-section { margin-left:auto; width:280px; }
  .total-row { display:flex; justify-content:space-between; padding:5px 0; font-size:12px; }
  .total-row.grand { border-top:2px solid #0f1d35; padding-top:10px; margin-top:5px; font-size:14px; font-weight:800; color:#0f1d35; }
  .payment-methods { margin-top:16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px; }
  .payment-methods-title { font-size:10px; font-weight:700; color:#15803d; text-transform:uppercase; margin-bottom:8px; }
  .payment-row { display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px; }
  .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:10px; color:#9ca3af; text-align:center; }
  .status-badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; }
  .status-paid { background:#f0fdf4; color:#15803d; border:1px solid #86efac; }
  .status-partial { background:#fffbeb; color:#b45309; border:1px solid #fcd34d; }
  @media print { body { padding:20px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic-name">${invoice.clinic.name}</div>
      <div class="clinic-sub">${invoice.clinic.branch} · ${invoice.clinic.address}</div>
      <div class="clinic-sub">${invoice.clinic.phone}</div>
    </div>
    <div style="text-align:right">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">${invoice.invoice_number}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px">${new Date(invoice.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
      <div style="margin-top:8px">
        <span class="status-badge ${remaining <= 0 ? 'status-paid' : 'status-partial'}">
          ${remaining <= 0 ? '✓ LUNAS' : 'SEBAGIAN'}
        </span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Data Pasien</div>
    <div class="info-grid">
      <div class="info-item"><label>Nama Pasien</label><span>${invoice.patient.full_name}</span></div>
      <div class="info-item"><label>No. Rekam Medis</label><span style="font-family:monospace">${invoice.patient.rm_number}</span></div>
      <div class="info-item"><label>No. Telepon</label><span>${invoice.patient.phone || '-'}</span></div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th style="width:50%">Tindakan / Treatment</th>
      <th class="text-right" style="width:10%">Qty</th>
      <th class="text-right" style="width:20%">Harga Satuan</th>
      <th class="text-right" style="width:20%">Total</th>
    </tr></thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td>${item.treatment_name}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${fmt(item.unit_price)}</td>
          <td class="text-right" style="font-weight:600">${fmt(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="display:flex;justify-content:flex-end">
    <div class="total-section">
      <div class="total-row"><span>Subtotal</span><span>${fmt(invoice.subtotal)}</span></div>
      ${invoice.discount_amount > 0 ? `<div class="total-row" style="color:#16a34a"><span>Diskon</span><span>− ${fmt(invoice.discount_amount)}</span></div>` : ''}
      ${invoice.tax_amount > 0 ? `<div class="total-row"><span>Pajak</span><span>${fmt(invoice.tax_amount)}</span></div>` : ''}
      <div class="total-row grand"><span>TOTAL</span><span style="color:#2563eb">${fmt(invoice.total)}</span></div>
    </div>
  </div>

  <div class="payment-methods">
    <div class="payment-methods-title">Pembayaran Diterima</div>
    ${invoice.payments.map(p => `
      <div class="payment-row">
        <span>${{ cash: 'Tunai', card: 'Kartu', qris: 'QRIS', transfer: 'Transfer', insurance: 'Asuransi', deposit: 'Deposit' }[p.method] || p.method}</span>
        <span style="font-weight:600">${fmt(p.amount)}</span>
      </div>
    `).join('')}
    ${remaining > 0 ? `<div class="payment-row" style="color:#dc2626;margin-top:8px;padding-top:8px;border-top:1px solid #fca5a5"><span style="font-weight:700">Sisa Tagihan</span><span style="font-weight:700">${fmt(remaining)}</span></div>` : ''}
  </div>

  ${invoice.notes ? `<div style="margin-top:16px;padding:10px 14px;background:#f8fafc;border-radius:6px;font-size:11px;color:#6b7280">Catatan: ${invoice.notes}</div>` : ''}

  <div class="footer">
    Dokumen ini dicetak secara otomatis oleh sistem ${invoice.clinic.name} · ${invoice.invoice_number}<br>
    Terima kasih atas kunjungan Anda. Kesehatan gigi Anda adalah prioritas kami.
  </div>
</body>
</html>`;
}
function buildPayrollSlipHtml(slip) {
    const fmt = (n) => 'Rp ' + n.toLocaleString('id-ID');
    const final = slip.override_amount ?? slip.doctor_amount;
    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,sans-serif; font-size:12px; color:#1f2937; padding:40px; max-width:480px; margin:0 auto; }
  .header { text-align:center; padding:24px; background:#0f1d35; color:white; border-radius:12px; margin-bottom:24px; }
  .clinic { font-size:16px; font-weight:800; }
  .slip-title { font-size:11px; opacity:0.7; margin-top:4px; letter-spacing:0.1em; text-transform:uppercase; }
  .doctor-name { font-size:18px; font-weight:700; margin-top:12px; }
  .period { font-size:12px; opacity:0.8; margin-top:4px; }
  .card { background:white; border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:16px; }
  .card-title { font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px; }
  .row { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #f1f5f9; font-size:12px; }
  .row:last-child { border-bottom:none; }
  .row.total { border-top:2px solid #0f1d35; padding-top:12px; margin-top:4px; font-size:16px; font-weight:800; color:#0f1d35; }
  .amount { font-weight:700; }
  .green { color:#16a34a; }
  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; background:#fef3c7; color:#92400e; border:1px solid #fcd34d; }
  .footer { text-align:center; font-size:10px; color:#9ca3af; margin-top:20px; }
</style>
</head>
<body>
  <div class="header">
    <div class="clinic">${slip.clinic.name} · ${slip.clinic.branch}</div>
    <div class="slip-title">Slip Gaji / Bagi Hasil Dokter</div>
    <div class="doctor-name">${slip.doctor_name}</div>
    <div class="period">${slip.period}</div>
  </div>

  <div class="card">
    <div class="card-title">Ringkasan Performa</div>
    <div class="row"><span>Total Tindakan</span><span class="amount">${slip.total_visits} kunjungan</span></div>
    <div class="row"><span>Total Revenue</span><span class="amount">${fmt(slip.total_revenue)}</span></div>
    <div class="row"><span>Kode Share</span><span><span class="badge">${slip.share_code}</span></span></div>
  </div>

  <div class="card">
    <div class="card-title">Kalkulasi Bagi Hasil</div>
    <div class="row"><span>Revenue Kotor</span><span class="amount">${fmt(slip.total_revenue)}</span></div>
    <div class="row"><span>Porsi Dokter (${slip.doctor_pct}%)</span><span class="amount green">${fmt(slip.doctor_amount)}</span></div>
    <div class="row"><span>Porsi Klinik (${slip.clinic_pct}%)</span><span class="amount">${fmt(slip.clinic_amount)}</span></div>
    ${slip.override_amount ? `<div class="row" style="color:#7c3aed"><span>Override Manual</span><span class="amount">${fmt(slip.override_amount)}<br><small style="font-weight:400">${slip.override_reason || ''}</small></span></div>` : ''}
    <div class="row total"><span>Dibayarkan ke Dokter</span><span class="green">${fmt(final)}</span></div>
  </div>

  <div class="footer">
    Dicetak: ${new Date(slip.generated_at).toLocaleString('id-ID')}<br>
    ${slip.clinic.name} · Sistem Manajemen Klinik
  </div>
</body>
</html>`;
}
//# sourceMappingURL=pdf.templates.js.map