import { db } from '@/db'
import { invoices, appSettings } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

export async function generateInvoiceNumber(): Promise<string> {
  await db.insert(appSettings).values({ id: 1 }).onConflictDoNothing()
  const [[settings], [{ count }]] = await Promise.all([
    db.select({ prefix: appSettings.invoicePrefix, start: appSettings.invoiceStartNumber })
      .from(appSettings).where(eq(appSettings.id, 1)),
    db.select({ count: sql<number>`count(*)` }).from(invoices),
  ])

  const prefix = settings?.prefix ?? 'INV'
  const start = settings?.start ?? 1001
  const num = start + Number(count)
  return `${prefix}-${num}`
}
