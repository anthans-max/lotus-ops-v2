export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { db } from '@/db'
import { contracts, contractTemplates, projects, clients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getBrowser } from '@/lib/browser'
import { createAdminClient } from '@/lib/supabase/admin'

function fillTemplate(html: string, variables: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [contract] = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      status: contracts.status,
      filledVariables: contracts.filledVariables,
      pdfUrl: contracts.pdfUrl,
      templateId: contracts.templateId,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(contracts)
    .leftJoin(projects, eq(projects.id, contracts.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(contracts.id, id))

  if (!contract) {
    return new Response('Contract not found', { status: 404 })
  }

  // If no template, redirect to a short-lived signed URL for the uploaded PDF
  if (!contract.templateId) {
    if (contract.pdfUrl) {
      const supabase = createAdminClient()
      const { data, error } = await supabase.storage
        .from('contracts')
        .createSignedUrl(contract.pdfUrl, 3600)
      if (error || !data) {
        return new Response(`Could not sign PDF URL: ${error?.message ?? 'unknown'}`, { status: 500 })
      }
      return Response.redirect(data.signedUrl)
    }
    return new Response('No PDF or template for this contract', { status: 404 })
  }

  const [template] = await db
    .select()
    .from(contractTemplates)
    .where(eq(contractTemplates.id, contract.templateId))

  if (!template) {
    return new Response('Template not found', { status: 404 })
  }

  const variables = (contract.filledVariables as Record<string, string>) ?? {}
  const html = fillTemplate(template.bodyHtml, variables)

  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Georgia, serif; font-size: 12pt; color: #3D2E1E; line-height: 1.6; padding: 60px; max-width: 800px; margin: 0 auto; }
        h1, h2, h3 { font-family: Georgia, serif; color: #2D4A35; }
        p { margin-bottom: 12px; }
        .contract-header { border-bottom: 2px solid #2D4A35; padding-bottom: 20px; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="contract-header">
        <h1>${contract.contractNumber}</h1>
        <p style="color: #7A6045;">${contract.projectName ?? ''} ${contract.clientName ? `— ${contract.clientName}` : ''}</p>
      </div>
      ${html}
    </body>
    </html>
  `

  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.setContent(styledHtml, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } })
  await page.close()

  return new Response(Buffer.from(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contract-${contract.contractNumber}.pdf"`,
    },
  })
}
