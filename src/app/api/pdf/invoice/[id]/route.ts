export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { createElement, type ReactElement } from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { db } from '@/db'
import { invoices, invoiceLineItems, clients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSettings } from '@/app/actions/settings'
import { InvoicePDF, type InvoicePDFData } from '@/components/invoices/InvoicePDF'

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
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
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
    return new Response('Invoice not found', { status: 404 })
  }

  const data: InvoicePDFData = {
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

  // InvoicePDF renders a <Document> at runtime; cast to satisfy renderToBuffer's strict typing.
  const element = createElement(InvoicePDF, { data }) as unknown as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(element)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${inv.invoiceNumber}.pdf"`,
    },
  })
}
