'use server'

import { db } from '@/db'
import { contractTemplates, contracts } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { InferSelectModel } from 'drizzle-orm'

export type ContractTemplate = InferSelectModel<typeof contractTemplates>

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createTemplate(input: {
  name: string
  description?: string
  bodyHtml: string
  variables?: { key: string; label: string; type: string }[]
}): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .insert(contractTemplates)
      .values({
        name: input.name,
        description: input.description ?? null,
        bodyHtml: input.bodyHtml,
        variables: input.variables ?? [],
      })
      .returning({ id: contractTemplates.id })
    revalidatePath('/contracts/templates')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateTemplate(
  id: string,
  input: {
    name?: string
    description?: string
    bodyHtml?: string
    variables?: { key: string; label: string; type: string }[]
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const [row] = await db
      .update(contractTemplates)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(contractTemplates.id, id))
      .returning({ id: contractTemplates.id })
    revalidatePath('/contracts/templates')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteTemplate(id: string): Promise<ActionResult<undefined>> {
  try {
    // Check if any contracts use this template
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contracts)
      .where(eq(contracts.templateId, id))

    if (Number(count) > 0) {
      return {
        success: false,
        error: `Cannot delete — ${count} contract${Number(count) !== 1 ? 's' : ''} use this template.`,
      }
    }

    await db.delete(contractTemplates).where(eq(contractTemplates.id, id))
    revalidatePath('/contracts/templates')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function createContractFromTemplate(input: {
  templateId: string
  projectId: string
  filledVariables: Record<string, string>
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { generateContractNumber } = await import('@/lib/contract-number')
    const contractNumber = await generateContractNumber()

    const [row] = await db
      .insert(contracts)
      .values({
        projectId: input.projectId,
        templateId: input.templateId,
        contractNumber,
        status: 'draft',
        filledVariables: input.filledVariables,
      })
      .returning({ id: contracts.id })

    revalidatePath('/contracts')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
