export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { db } from '@/db'
import { invoices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json(
      { error: 'Server misconfigured: SUPABASE_SERVICE_ROLE_KEY not set' },
      { status: 500 }
    )
  }

  const { id } = await params
  const wantDownload = new URL(request.url).searchParams.get('download') === '1'

  const [inv] = await db
    .select({ filePath: invoices.filePath })
    .from(invoices)
    .where(eq(invoices.id, id))

  if (!inv?.filePath) {
    return Response.json({ error: 'No file attached to this invoice' }, { status: 404 })
  }

  if (!inv.filePath.startsWith(`${id}/`) || inv.filePath.includes('..')) {
    return Response.json({ error: 'Invalid file path' }, { status: 400 })
  }

  const filename = inv.filePath.split('/').pop() ?? 'attachment'

  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from('invoice-docs')
    .createSignedUrl(inv.filePath, 60, wantDownload ? { download: filename } : undefined)

  if (error || !data) {
    console.error('Invoice signed URL error', { invoiceId: id, error })
    return Response.json(
      { error: error?.message ?? 'Could not generate signed URL' },
      { status: 500 }
    )
  }

  return Response.json({ url: data.signedUrl })
}
