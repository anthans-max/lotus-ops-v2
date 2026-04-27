export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { db } from '@/db'
import { invoices, invoiceLineItems, clients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getBrowser } from '@/lib/browser'
import { getSettings } from '@/app/actions/settings'

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatMoney(value: unknown): string {
  const n = Number(value ?? 0)
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatQty(value: unknown): string {
  const n = Number(value ?? 1)
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  paymentTerms: number
  notes: string | null
  subtotal: string
  total: string
  paidAmount: string
  balanceDue: string
  clientName: string
  clientAddress: string | null
  clientEmail: string | null
  companyName: string
  companyAddress: string | null
  companyEmail: string | null
  companyPhone: string | null
  lineItems: { id: string; description: string; quantity: string; rate: string; amount: string }[]
}

function renderInvoiceHtml(d: InvoiceData): string {
  const rows = d.lineItems
    .map(
      (li) => `
        <tr>
          <td>${escapeHtml(li.description)}</td>
          <td class="num">${escapeHtml(formatQty(li.quantity))}</td>
          <td class="num">$${escapeHtml(formatMoney(li.rate))}</td>
          <td class="num">$${escapeHtml(formatMoney(li.amount))}</td>
        </tr>`,
    )
    .join('')

  const companyContactLines = [d.companyAddress, d.companyEmail, d.companyPhone]
    .filter((v): v is string => Boolean(v))
    .map((v) => escapeHtml(v))
    .join('<br>')

  const termsBody = d.notes && d.notes.trim().length > 0
    ? escapeHtml(d.notes)
    : `Net ${d.paymentTerms} payment terms apply. Please remit payment by ${escapeHtml(d.dueDate)}.`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 48px 56px;
      font-size: 11pt;
      line-height: 1.5;
      margin: 0;
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; gap: 32px; }
    .company { max-width: 60%; }
    .company-name { font-family: 'Cormorant Garamond', serif; font-size: 20pt; font-weight: 600; margin: 0 0 6px 0; line-height: 1.2; }
    .company-detail { font-family: 'Inter', sans-serif; font-size: 9pt; color: #555; line-height: 1.55; }
    .invoice-block { text-align: right; min-width: 240px; }
    .invoice-title { font-family: 'Cormorant Garamond', serif; font-size: 30pt; font-weight: 700; letter-spacing: 3px; margin: 0 0 14px 0; }
    .meta-grid { font-family: 'Inter', sans-serif; font-size: 9pt; color: #1a1a1a; }
    .meta-grid .row { display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 3px; }
    .meta-grid .label { color: #777; }
    .meta-grid .value { font-weight: 500; min-width: 110px; text-align: right; }
    .balance-due { font-family: 'Cormorant Garamond', serif; font-size: 13pt; font-weight: 700; color: #1a1a1a; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; gap: 12px; }
    .balance-due .label { color: #1a1a1a; }
    .bill-to { margin-bottom: 28px; }
    .section-label { font-family: 'Inter', sans-serif; font-size: 8pt; text-transform: uppercase; letter-spacing: 1.5px; color: #777; margin: 0 0 8px 0; font-weight: 500; }
    .client-name { font-family: 'Cormorant Garamond', serif; font-size: 13pt; font-weight: 600; margin-bottom: 2px; }
    .client-detail { font-family: 'Inter', sans-serif; font-size: 9pt; color: #555; line-height: 1.55; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-family: 'Inter', sans-serif; font-size: 9.5pt; }
    table.items th { text-align: left; padding: 10px 8px; border-bottom: 1.5px solid #1a1a1a; font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; color: #1a1a1a; }
    table.items th.num, table.items td.num { text-align: right; }
    table.items td { padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    table.items td:first-child { color: #1a1a1a; }
    .totals { margin-left: auto; width: 280px; font-family: 'Inter', sans-serif; font-size: 10pt; }
    .totals .row { display: flex; justify-content: space-between; padding: 5px 0; color: #444; }
    .totals .row.total { font-weight: 700; font-size: 11pt; color: #1a1a1a; border-top: 1.5px solid #1a1a1a; margin-top: 6px; padding-top: 9px; }
    .footer-section { margin-top: 28px; }
    .footer-section h4 { font-family: 'Inter', sans-serif; font-size: 8pt; text-transform: uppercase; letter-spacing: 1.5px; color: #777; margin: 0 0 8px 0; font-weight: 500; }
    .footer-section p { font-family: 'Inter', sans-serif; font-size: 9pt; color: #444; line-height: 1.65; margin: 0; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <div class="company-name">${escapeHtml(d.companyName)}</div>
      <div class="company-detail">${companyContactLines}</div>
    </div>
    <div class="invoice-block">
      <div class="invoice-title">INVOICE</div>
      <div class="meta-grid">
        <div class="row"><span class="label">Invoice #</span><span class="value">${escapeHtml(d.invoiceNumber)}</span></div>
        <div class="row"><span class="label">Issue Date</span><span class="value">${escapeHtml(d.issueDate)}</span></div>
        <div class="row"><span class="label">Payment Terms</span><span class="value">Net ${escapeHtml(d.paymentTerms)}</span></div>
        <div class="row"><span class="label">Due Date</span><span class="value">${escapeHtml(d.dueDate)}</span></div>
        <div class="balance-due"><span class="label">Balance Due</span><span class="value">$${escapeHtml(formatMoney(d.balanceDue))}</span></div>
      </div>
    </div>
  </div>

  <div class="bill-to">
    <h3 class="section-label">Bill To</h3>
    <div class="client-name">${escapeHtml(d.clientName)}</div>
    ${d.clientAddress ? `<div class="client-detail">${escapeHtml(d.clientAddress)}</div>` : ''}
    ${d.clientEmail ? `<div class="client-detail">${escapeHtml(d.clientEmail)}</div>` : ''}
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Description</th>
        <th class="num">Quantity</th>
        <th class="num">Rate</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>$${escapeHtml(formatMoney(d.subtotal))}</span></div>
    <div class="row"><span>Tax (0%)</span><span>$0.00</span></div>
    <div class="row total"><span>Total</span><span>$${escapeHtml(formatMoney(d.total))}</span></div>
  </div>

  <div class="footer-section">
    <h4>Notes</h4>
    <p>Thank you for your business.</p>
  </div>
  <div class="footer-section">
    <h4>Terms</h4>
    <p>${termsBody}</p>
  </div>
  <div class="footer-section">
    <h4>Bank Details</h4>
    <p>Bank Name: [Your Bank Name]
Routing #: [Routing Number]
Account #: [Account Number]</p>
  </div>
</body>
</html>`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const [[inv], lineItemRows, settings] = await Promise.all([
    db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        notes: invoices.notes,
        subtotal: invoices.subtotal,
        total: invoices.total,
        paidAmount: invoices.paidAmount,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientAddress: clients.address,
        clientEmail: clients.email,
        clientPaymentTerms: clients.paymentTerms,
      })
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .where(eq(invoices.id, id)),
    db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id))
      .orderBy(invoiceLineItems.createdAt),
    getSettings(),
  ])

  if (!inv) {
    return new Response('Invoice not found', { status: 404 })
  }

  const total = inv.total ?? '0'
  const paid = inv.paidAmount ?? '0'
  const balance = (Number(total) - Number(paid)).toFixed(2)

  const html = renderInvoiceHtml({
    invoiceNumber: inv.invoiceNumber,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    paymentTerms: inv.clientPaymentTerms ?? settings.defaultPaymentTerms ?? 30,
    notes: inv.notes,
    subtotal: inv.subtotal ?? '0',
    total,
    paidAmount: paid,
    balanceDue: balance,
    clientName: inv.clientName ?? 'Unknown Client',
    clientAddress: inv.clientAddress,
    clientEmail: inv.clientEmail,
    companyName: settings.companyName ?? 'AaraSaan Consulting, Inc.',
    companyAddress: settings.companyAddress,
    companyEmail: settings.companyEmail,
    companyPhone: settings.companyPhone,
    lineItems: lineItemRows.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity ?? '1',
      rate: li.rate,
      amount: li.amount,
    })),
  })

  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
  })
  await page.close()

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${inv.invoiceNumber}.pdf"`,
    },
  })
}
