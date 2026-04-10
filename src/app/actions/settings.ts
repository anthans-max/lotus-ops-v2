'use server'

import { db } from '@/db'
import { appSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { InferSelectModel } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export type AppSettings = InferSelectModel<typeof appSettings>

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getSettings(): Promise<AppSettings> {
  await db.insert(appSettings).values({ id: 1 }).onConflictDoNothing()
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, 1))
  return row
}

export async function updateSettings(input: {
  companyName?: string
  companyAddress?: string
  companyEmail?: string
  companyPhone?: string
  logoUrl?: string
  invoicePrefix?: string
  contractPrefix?: string
  invoiceStartNumber?: number
  contractStartNumber?: number
  taxName?: string
  taxRate?: string | number
  taxNumber?: string
  defaultPaymentTerms?: number
  lateFeePercent?: string | number
  defaultRate?: string | number
}): Promise<ActionResult<AppSettings>> {
  try {
    const [row] = await db
      .update(appSettings)
      .set({
        ...input,
        taxRate: input.taxRate !== undefined ? String(input.taxRate) : undefined,
        lateFeePercent: input.lateFeePercent !== undefined ? String(input.lateFeePercent) : undefined,
        defaultRate: input.defaultRate !== undefined ? String(input.defaultRate) : undefined,
      })
      .where(eq(appSettings.id, 1))
      .returning()
    revalidatePath('/settings')
    revalidatePath('/invoices')
    return { success: true, data: row }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function uploadLogo(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const file = formData.get('logo') as File | null
    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided.' }
    }

    const supabase = await createClient()
    const ext = file.name.split('.').pop() ?? 'png'
    const fileName = `logo-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName)
    const url = urlData.publicUrl

    await updateSettings({ logoUrl: url })
    return { success: true, data: { url } }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
