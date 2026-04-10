export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/db";
import { invoices, invoiceLineItems, clients, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InvoiceDetailView, type InvoiceDetailData } from "@/components/invoices/invoice-detail-view";
import { getSettings } from "@/app/actions/settings";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [[inv], lineItemRows, settings] = await Promise.all([
    db
      .select({
        id: invoices.id,
        clientId: invoices.clientId,
        projectId: invoices.projectId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        total: invoices.total,
        paidAmount: invoices.paidAmount,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        clientName: clients.name,
        clientAddress: clients.address,
        clientEmail: clients.email,
        projectName: projects.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .leftJoin(projects, eq(projects.id, invoices.projectId))
      .where(eq(invoices.id, id)),

    db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id))
      .orderBy(invoiceLineItems.createdAt),

    getSettings(),
  ]);

  if (!inv) notFound();

  const invoiceData: InvoiceDetailData = {
    ...inv,
    clientName: inv.clientName ?? null,
    clientAddress: inv.clientAddress ?? null,
    clientEmail: inv.clientEmail ?? null,
    projectName: inv.projectName ?? null,
    lineItems: lineItemRows,
    taxName: settings.taxName ?? "Tax",
  };

  return <InvoiceDetailView invoice={invoiceData} />;
}
