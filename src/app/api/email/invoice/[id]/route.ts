export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { db } from '@/db'
import { invoices, invoiceLineItems, clients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoices/InvoicePDF'
import { getSettings } from '@/app/actions/settings'
import { Resend } from 'resend'
import React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [[inv], lineItemRows, settings] = await Promise.all([
    db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        status: invoices.status,
        notes: invoices.notes,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        total: invoices.total,
        paidAmount: invoices.paidAmount,
        clientName: clients.name,
        clientAddress: clients.address,
        clientEmail: clients.email,
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
    return Response.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (!inv.clientEmail) {
    return Response.json({ error: 'Client has no email address.' }, { status: 400 })
  }

  const pdfData = {
    invoiceNumber: inv.invoiceNumber,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    status: inv.status ?? 'draft',
    notes: inv.notes,
    subtotal: inv.subtotal ?? '0',
    taxAmount: inv.taxAmount ?? '0',
    taxName: settings.taxName ?? 'Tax',
    total: inv.total ?? '0',
    paidAmount: inv.paidAmount ?? '0',
    clientName: inv.clientName ?? 'Client',
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
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }) as any)

  const fromEmail = settings.companyEmail ?? 'invoices@getlotusai.com'
  const fromName = settings.companyName ?? 'AaraSaan Consulting'

  const { error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: [inv.clientEmail],
    subject: `Invoice ${inv.invoiceNumber} from ${fromName}`,
    html: `
      <p>Hi ${inv.clientName},</p>
      <p>Please find your invoice ${inv.invoiceNumber} attached for $${Number(inv.total ?? 0).toFixed(2)}, due ${inv.dueDate}.</p>
      ${inv.notes ? `<p>${inv.notes}</p>` : ''}
      <p>Thank you,<br/>${fromName}</p>
    `,
    attachments: [
      {
        filename: `invoice-${inv.invoiceNumber}.pdf`,
        content: buffer,
      },
    ],
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Mark as sent
  await db
    .update(invoices)
    .set({ status: 'sent', updatedAt: new Date() })
    .where(eq(invoices.id, id))

  return Response.json({ sent: true })
}
