import { db } from '@/db'
import { contracts, appSettings } from '@/db/schema'
import { sql, eq, and } from 'drizzle-orm'

export async function generateContractNumber(): Promise<string> {
  await db.insert(appSettings).values({ id: 1 }).onConflictDoNothing()
  const year = new Date().getFullYear()

  const [[settings], [{ count }]] = await Promise.all([
    db
      .select({ prefix: appSettings.contractPrefix, start: appSettings.contractStartNumber })
      .from(appSettings)
      .where(eq(appSettings.id, 1)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contracts),
  ])

  const prefix = settings?.prefix ?? 'LAI'
  const start = settings?.start ?? 1001
  const num = start + Number(count)
  return `${prefix}-${year}-${String(num).padStart(3, '0')}`
}
