'use server'

import { db } from '@/db'
import { contracts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { InferSelectModel } from 'drizzle-orm'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateContractNumber } from '@/lib/contract-number'

export type Contract = InferSelectModel<typeof contracts>

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createContract(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const projectId = formData.get('projectId') as string | null
    const file = formData.get('pdf') as File | null

    if (!projectId) return { success: false, error: 'Project is required.' }

    let pdfPath: string | null = null

    if (file && file.size > 0) {
      const supabase = createAdminClient()
      const ext = file.name.split('.').pop() ?? 'pdf'
      const fileName = `contract-${Date.now()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, buffer, { contentType: file.type, upsert: false })

      if (uploadError) return { success: false, error: uploadError.message }

      pdfPath = fileName
    }

    const contractNumber = await generateContractNumber()

    const [row] = await db
      .insert(contracts)
      .values({
        projectId,
        contractNumber,
        status: 'draft',
        pdfUrl: pdfPath,
      })
      .returning({ id: contracts.id })

    revalidatePath('/contracts')
    return { success: true, data: { id: row.id } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateContractStatus(
  id: string,
  status: string
): Promise<ActionResult<undefined>> {
  try {
    const updates: Partial<Contract> = { status }
    if (status === 'sent') updates.sentAt = new Date()
    if (status === 'signed') updates.signedAt = new Date()

    await db
      .update(contracts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contracts.id, id))

    revalidatePath('/contracts')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteContract(id: string): Promise<ActionResult<undefined>> {
  try {
    const [contract] = await db
      .select({ pdfUrl: contracts.pdfUrl })
      .from(contracts)
      .where(eq(contracts.id, id))

    if (contract?.pdfUrl) {
      try {
        const supabase = createAdminClient()
        await supabase.storage.from('contracts').remove([contract.pdfUrl])
      } catch {
        // Non-fatal: continue with DB delete
      }
    }

    await db.delete(contracts).where(eq(contracts.id, id))
    revalidatePath('/contracts')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
