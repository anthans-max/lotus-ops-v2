'use server'

import { db } from '@/db'
import { projects, contracts, timeEntries, invoices } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { InferSelectModel } from 'drizzle-orm'

export type Project = InferSelectModel<typeof projects>

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createProject(input: {
  clientId: string
  name: string
  description?: string
  status?: string
  billingType?: string
  defaultRate?: string
  budgetHours?: string
  budgetAmount?: string
  startDate?: string
  endDate?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .insert(projects)
      .values({
        clientId: input.clientId,
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? 'active',
        billingType: input.billingType ?? 'hourly',
        defaultRate: input.defaultRate ?? null,
        budgetHours: input.budgetHours ?? null,
        budgetAmount: input.budgetAmount ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
      })
      .returning({ id: projects.id })
    revalidatePath('/projects')
    revalidatePath('/clients')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateProject(
  id: string,
  input: {
    clientId?: string
    name?: string
    description?: string
    status?: string
    billingType?: string
    defaultRate?: string
    budgetHours?: string
    budgetAmount?: string
    startDate?: string
    endDate?: string
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .update(projects)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning({ id: projects.id })
    revalidatePath('/projects')
    revalidatePath('/clients')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteProject(id: string): Promise<ActionResult<undefined>> {
  try {
    const [{ contractCount }] = await db
      .select({ contractCount: sql<number>`count(*)` })
      .from(contracts)
      .where(eq(contracts.projectId, id))

    const [{ timeCount }] = await db
      .select({ timeCount: sql<number>`count(*)` })
      .from(timeEntries)
      .where(eq(timeEntries.projectId, id))

    const [{ invoiceCount }] = await db
      .select({ invoiceCount: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.projectId, id))

    const cCount = Number(contractCount)
    const tCount = Number(timeCount)
    const iCount = Number(invoiceCount)

    if (cCount > 0 || tCount > 0 || iCount > 0) {
      const parts: string[] = []
      if (cCount > 0) parts.push(`${cCount} contract${cCount !== 1 ? 's' : ''}`)
      if (tCount > 0) parts.push(`${tCount} time entr${tCount !== 1 ? 'ies' : 'y'}`)
      if (iCount > 0) parts.push(`${iCount} invoice${iCount !== 1 ? 's' : ''}`)
      return {
        success: false,
        error: `Cannot delete — this project has ${parts.join(', ')} linked to it. Remove those first.`,
      }
    }

    await db.delete(projects).where(eq(projects.id, id))
    revalidatePath('/projects')
    revalidatePath('/clients')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
