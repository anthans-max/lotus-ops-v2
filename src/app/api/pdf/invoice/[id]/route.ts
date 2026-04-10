export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { db } from '@/db'
import { invoices, invoiceLineItems, clients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoices/InvoicePDF'
import { getSettings } from '@/app/actions/settings'
import React from 'react'

export async function GET(
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
        clientId: invoices.clientId,
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
    return new Response('Invoice not found', { status: 404 })
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
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }) as any)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${inv.invoiceNumber}.pdf"`,
    },
  })
}
