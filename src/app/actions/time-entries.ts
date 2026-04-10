'use server'

import { db } from '@/db'
import { timeEntries, projects, clients } from '@/db/schema'
import { eq, sql, inArray, and, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { InferSelectModel } from 'drizzle-orm'

export type TimeEntry = InferSelectModel<typeof timeEntries>

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createTimeEntry(input: {
  projectId: string
  date: string
  hours: string
  rate?: string
  description?: string
  status?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .insert(timeEntries)
      .values({
        projectId: input.projectId,
        date: input.date,
        hours: input.hours,
        rate: input.rate ?? null,
        description: input.description ?? null,
        status: input.status ?? 'draft',
      })
      .returning({ id: timeEntries.id })
    revalidatePath('/time-tracking')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateTimeEntry(
  id: string,
  input: {
    projectId?: string
    date?: string
    hours?: string
    rate?: string
    description?: string
    status?: string
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .update(timeEntries)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(timeEntries.id, id))
      .returning({ id: timeEntries.id })
    revalidatePath('/time-tracking')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteTimeEntry(id: string): Promise<ActionResult<undefined>> {
  try {
    const [entry] = await db
      .select({ status: timeEntries.status })
      .from(timeEntries)
      .where(eq(timeEntries.id, id))

    if (!entry) return { success: false, error: 'Time entry not found.' }
    if (entry.status === 'invoiced') {
      return { success: false, error: 'Cannot delete — this entry has been invoiced.' }
    }

    await db.delete(timeEntries).where(eq(timeEntries.id, id))
    revalidatePath('/time-tracking')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function submitTimeEntries(ids: string[]): Promise<ActionResult<{ count: number }>> {
  try {
    const result = await db
      .update(timeEntries)
      .set({ status: 'submitted', updatedAt: new Date() })
      .where(and(inArray(timeEntries.id, ids), eq(timeEntries.status, 'draft')))
      .returning({ id: timeEntries.id })
    revalidatePath('/time-tracking')
    return { success: true, data: { count: result.length } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function approveTimeEntry(id: string): Promise<ActionResult<undefined>> {
  try {
    const [entry] = await db
      .select({ status: timeEntries.status })
      .from(timeEntries)
      .where(eq(timeEntries.id, id))

    if (!entry) return { success: false, error: 'Time entry not found.' }
    if (entry.status !== 'submitted') {
      return { success: false, error: 'Only submitted entries can be approved.' }
    }

    await db
      .update(timeEntries)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(timeEntries.id, id))
    revalidatePath('/time-tracking')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function rejectTimeEntry(id: string): Promise<ActionResult<undefined>> {
  try {
    const [entry] = await db
      .select({ status: timeEntries.status })
      .from(timeEntries)
      .where(eq(timeEntries.id, id))

    if (!entry) return { success: false, error: 'Time entry not found.' }
    if (entry.status !== 'submitted') {
      return { success: false, error: 'Only submitted entries can be rejected.' }
    }

    await db
      .update(timeEntries)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(timeEntries.id, id))
    revalidatePath('/time-tracking')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function markAsInvoiced(
  ids: string[],
  invoiceId: string
): Promise<ActionResult<undefined>> {
  try {
    await db
      .update(timeEntries)
      .set({ status: 'invoiced', invoiceId, updatedAt: new Date() })
      .where(inArray(timeEntries.id, ids))
    revalidatePath('/time-tracking')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getApprovedTimeEntriesForProject(
  projectId: string
): Promise<ActionResult<TimeEntry[]>> {
  try {
    const rows = await db
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.projectId, projectId),
          eq(timeEntries.status, 'approved'),
          isNull(timeEntries.invoiceId)
        )
      )
      .orderBy(timeEntries.date)
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
