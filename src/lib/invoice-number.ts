import { db } from '@/db'
import { appSettings } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

/**
 * Generates the next invoice number in the format INV-YYYY-NNN.
 *
 * The sequence is stored on the singleton app_settings row and resets
 * each calendar year. The read+increment is performed in a single
 * conditional UPDATE so concurrent invoice creations cannot collide.
 */
export async function generateInvoiceNumber(): Promise<string> {
  await db.insert(appSettings).values({ id: 1 }).onConflictDoNothing()

  const year = new Date().getFullYear()

  const [row] = await db
    .update(appSettings)
    .set({
      invoiceStartNumber: sql`CASE WHEN ${appSettings.invoiceSequenceYear} = ${year} THEN ${appSettings.invoiceStartNumber} + 1 ELSE 1 END`,
      invoiceSequenceYear: year,
    })
    .where(eq(appSettings.id, 1))
    .returning({
      prefix: appSettings.invoicePrefix,
      next: appSettings.invoiceStartNumber,
    })

  const prefix = row?.prefix ?? 'INV'
  const next = row?.next ?? 1
  return `${prefix}-${year}-${String(next).padStart(3, '0')}`
}
