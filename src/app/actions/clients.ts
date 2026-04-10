'use server'

import { db } from '@/db'
import { clients, contacts, projects, invoices } from '@/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { InferSelectModel } from 'drizzle-orm'

export type Client = InferSelectModel<typeof clients>
export type Contact = InferSelectModel<typeof contacts>

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Clients ─────────────────────────────────────────────────────

export async function createClient(input: {
  name: string
  address?: string
  email?: string
  phone?: string
  paymentTerms?: number
  status?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .insert(clients)
      .values({
        name: input.name,
        address: input.address ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        paymentTerms: input.paymentTerms ?? 30,
        status: input.status ?? 'active',
      })
      .returning({ id: clients.id })
    revalidatePath('/clients')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateClient(
  id: string,
  input: {
    name?: string
    address?: string
    email?: string
    phone?: string
    paymentTerms?: number
    status?: string
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .update(clients)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning({ id: clients.id })
    revalidatePath('/clients')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteClient(id: string): Promise<ActionResult<undefined>> {
  try {
    // Check for dependent projects
    const [{ projectCount }] = await db
      .select({ projectCount: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.clientId, id))

    // Check for dependent invoices
    const [{ invoiceCount }] = await db
      .select({ invoiceCount: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.clientId, id))

    const pCount = Number(projectCount)
    const iCount = Number(invoiceCount)

    if (pCount > 0 || iCount > 0) {
      const parts: string[] = []
      if (pCount > 0) parts.push(`${pCount} project${pCount !== 1 ? 's' : ''}`)
      if (iCount > 0) parts.push(`${iCount} invoice${iCount !== 1 ? 's' : ''}`)
      return {
        success: false,
        error: `Cannot delete — this client has ${parts.join(' and ')} linked to them. Remove those first.`,
      }
    }

    await db.delete(clients).where(eq(clients.id, id))
    revalidatePath('/clients')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

// ── Contacts ────────────────────────────────────────────────────

export async function getContactsForClient(
  clientId: string
): Promise<ActionResult<Contact[]>> {
  try {
    const rows = await db
      .select()
      .from(contacts)
      .where(eq(contacts.clientId, clientId))
      .orderBy(contacts.isPrimary, contacts.name)
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function createContact(input: {
  clientId: string
  name: string
  title?: string
  email?: string
  phone?: string
  isPrimary?: boolean
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (input.isPrimary) {
      await db
        .update(contacts)
        .set({ isPrimary: false })
        .where(and(eq(contacts.clientId, input.clientId), eq(contacts.isPrimary, true)))
    }

    const [row] = await db
      .insert(contacts)
      .values({
        clientId: input.clientId,
        name: input.name,
        title: input.title ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        isPrimary: input.isPrimary ?? false,
      })
      .returning({ id: contacts.id })

    revalidatePath('/clients')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateContact(
  id: string,
  input: {
    clientId: string
    name?: string
    title?: string
    email?: string
    phone?: string
    isPrimary?: boolean
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    if (input.isPrimary) {
      await db
        .update(contacts)
        .set({ isPrimary: false })
        .where(and(eq(contacts.clientId, input.clientId), eq(contacts.isPrimary, true)))
    }

    const [row] = await db
      .update(contacts)
      .set({
        name: input.name,
        title: input.title,
        email: input.email,
        phone: input.phone,
        isPrimary: input.isPrimary,
      })
      .where(eq(contacts.id, id))
      .returning({ id: contacts.id })

    revalidatePath('/clients')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteContact(id: string): Promise<ActionResult<undefined>> {
  try {
    await db.delete(contacts).where(eq(contacts.id, id))
    revalidatePath('/clients')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
