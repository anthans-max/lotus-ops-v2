export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { notFound } from "next/navigation";
import { db } from "@/db";
import { invoices, invoiceLineItems, clients, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InvoiceDetailView, type InvoiceDetailData } from "@/components/invoices/invoice-detail-view";
import type { ClientOption, ProjectOption } from "@/components/invoices/invoice-form";
import { getSettings } from "@/app/actions/settings";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [[inv], lineItemRows, clientRows, projectRows, settings] = await Promise.all([
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
        summary: invoices.summary,
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

    db
      .select({ id: clients.id, name: clients.name, paymentTerms: clients.paymentTerms })
      .from(clients)
      .where(eq(clients.status, "active"))
      .orderBy(clients.name),

    db
      .select({ id: projects.id, name: projects.name, clientId: projects.clientId, defaultRate: projects.defaultRate })
      .from(projects)
      .where(eq(projects.status, "active"))
      .orderBy(projects.name),

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

  // Tax table stores only the amount; derive the rate for the edit form's pre-fill.
  const sub = Number(inv.subtotal ?? 0);
  const taxRate =
    sub > 0
      ? ((Number(inv.taxAmount ?? 0) / sub) * 100).toFixed(2)
      : settings.taxRate ?? "0";

  const clientOptions: ClientOption[] = clientRows;
  const projectOptions: ProjectOption[] = projectRows;

  return (
    <InvoiceDetailView
      invoice={invoiceData}
      clients={clientOptions}
      projects={projectOptions}
      taxRate={taxRate}
    />
  );
}
