'use server'

import { db } from '@/db'
import { invoices, invoiceLineItems, timeEntries } from '@/db/schema'
import { eq, sql, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { InferSelectModel } from 'drizzle-orm'
import { generateInvoiceNumber } from '@/lib/invoice-number'
import { markAsInvoiced } from './time-entries'

export type Invoice = InferSelectModel<typeof invoices>
export type InvoiceLineItem = InferSelectModel<typeof invoiceLineItems>

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Helpers ──────────────────────────────────────────────────────────────────

async function recalcTotals(invoiceId: string, taxRate: string = '0') {
  const [{ subtotal }] = await db
    .select({ subtotal: sql<string>`coalesce(sum(${invoiceLineItems.amount}), 0)` })
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoiceId))

  const sub = Number(subtotal)
  const tax = sub * (Number(taxRate) / 100)
  const total = sub + tax

  await db
    .update(invoices)
    .set({
      subtotal: sub.toFixed(2),
      taxAmount: tax.toFixed(2),
      total: total.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export async function createInvoice(input: {
  clientId: string
  projectId?: string
  issueDate: string
  dueDate: string
  notes?: string
  taxRate?: string
  lineItems: { description: string; quantity: string; rate: string; timeEntryId?: string }[]
  timeEntryIds?: string[]
}): Promise<ActionResult<{ id: string }>> {
  try {
    const invoiceNumber = await generateInvoiceNumber()

    const [inv] = await db
      .insert(invoices)
      .values({
        clientId: input.clientId,
        projectId: input.projectId ?? null,
        invoiceNumber,
        status: 'draft',
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        notes: input.notes ?? null,
        subtotal: '0',
        taxAmount: '0',
        total: '0',
        paidAmount: '0',
      })
      .returning({ id: invoices.id })

    if (input.lineItems.length > 0) {
      await db.insert(invoiceLineItems).values(
        input.lineItems.map((item) => ({
          invoiceId: inv.id,
          description: item.description,
          quantity: item.quantity || '1',
          rate: item.rate,
          amount: (Number(item.quantity || 1) * Number(item.rate)).toFixed(2),
          timeEntryId: item.timeEntryId ?? null,
        }))
      )
    }

    await recalcTotals(inv.id, input.taxRate)

    if (input.timeEntryIds && input.timeEntryIds.length > 0) {
      await markAsInvoiced(input.timeEntryIds, inv.id)
    }

    revalidatePath('/invoices')
    revalidatePath('/time-tracking')
    return { success: true, data: { id: inv.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateInvoice(
  id: string,
  input: {
    clientId?: string
    projectId?: string
    issueDate?: string
    dueDate?: string
    notes?: string
    status?: string
    taxRate?: string
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .update(invoices)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning({ id: invoices.id })

    if (input.taxRate !== undefined) {
      await recalcTotals(id, input.taxRate)
    }

    revalidatePath('/invoices')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteInvoice(id: string): Promise<ActionResult<undefined>> {
  try {
    const [inv] = await db
      .select({ status: invoices.status })
      .from(invoices)
      .where(eq(invoices.id, id))

    if (!inv) return { success: false, error: 'Invoice not found.' }
    if (inv.status === 'sent' || inv.status === 'paid') {
      return { success: false, error: 'Cannot delete a sent or paid invoice.' }
    }

    // Un-mark any linked time entries
    await db
      .update(timeEntries)
      .set({ status: 'approved', invoiceId: null, updatedAt: new Date() })
      .where(eq(timeEntries.invoiceId as any, id))

    // Line items cascade via FK
    await db.delete(invoices).where(eq(invoices.id, id))

    revalidatePath('/invoices')
    revalidatePath('/time-tracking')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function sendInvoice(id: string): Promise<ActionResult<undefined>> {
  try {
    await db
      .update(invoices)
      .set({ status: 'sent', updatedAt: new Date() })
      .where(eq(invoices.id, id))
    revalidatePath('/invoices')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function recordPayment(
  id: string,
  amount: string
): Promise<ActionResult<undefined>> {
  try {
    const [inv] = await db
      .select({ total: invoices.total, paidAmount: invoices.paidAmount })
      .from(invoices)
      .where(eq(invoices.id, id))

    if (!inv) return { success: false, error: 'Invoice not found.' }

    const newPaid = (Number(inv.paidAmount) + Number(amount)).toFixed(2)
    const status = Number(newPaid) >= Number(inv.total) ? 'paid' : 'sent'

    await db
      .update(invoices)
      .set({ paidAmount: newPaid, status, updatedAt: new Date() })
      .where(eq(invoices.id, id))

    revalidatePath('/invoices')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function voidInvoice(id: string): Promise<ActionResult<undefined>> {
  try {
    await db
      .update(invoices)
      .set({ status: 'void', updatedAt: new Date() })
      .where(eq(invoices.id, id))
    revalidatePath('/invoices')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

// ── Line Items ────────────────────────────────────────────────────────────────

export async function addLineItem(
  invoiceId: string,
  item: { description: string; quantity: string; rate: string; timeEntryId?: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const amount = (Number(item.quantity || 1) * Number(item.rate)).toFixed(2)
    const [row] = await db
      .insert(invoiceLineItems)
      .values({
        invoiceId,
        description: item.description,
        quantity: item.quantity || '1',
        rate: item.rate,
        amount,
        timeEntryId: item.timeEntryId ?? null,
      })
      .returning({ id: invoiceLineItems.id })
    await recalcTotals(invoiceId)
    revalidatePath('/invoices')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateLineItem(
  id: string,
  invoiceId: string,
  item: { description?: string; quantity?: string; rate?: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const [existing] = await db
      .select({ quantity: invoiceLineItems.quantity, rate: invoiceLineItems.rate })
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.id, id))

    const qty = item.quantity ?? existing.quantity ?? '1'
    const rate = item.rate ?? existing.rate
    const amount = (Number(qty) * Number(rate)).toFixed(2)

    const [row] = await db
      .update(invoiceLineItems)
      .set({ ...item, amount })
      .where(eq(invoiceLineItems.id, id))
      .returning({ id: invoiceLineItems.id })
    await recalcTotals(invoiceId)
    revalidatePath('/invoices')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteLineItem(
  id: string,
  invoiceId: string
): Promise<ActionResult<undefined>> {
  try {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id))
    await recalcTotals(invoiceId)
    revalidatePath('/invoices')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
