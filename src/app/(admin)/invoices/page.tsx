export const dynamic = "force-dynamic";

import { db } from "@/db";
import { invoices, clients, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { InvoicesView, type InvoiceWithClient } from "@/components/invoices/invoices-view";
import type { ClientOption, ProjectOption } from "@/components/invoices/invoice-form";
import { getSettings } from "@/app/actions/settings";

export default async function InvoicesPage() {
  const [invoiceRows, clientRows, projectRows, settings] = await Promise.all([
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
        projectName: projects.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .leftJoin(projects, eq(projects.id, invoices.projectId))
      .orderBy(desc(invoices.createdAt)),

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

  const invoiceList: InvoiceWithClient[] = invoiceRows.map((r) => ({
    ...r,
    clientName: r.clientName ?? null,
    projectName: r.projectName ?? null,
  }));

  const clientOptions: ClientOption[] = clientRows;
  const projectOptions: ProjectOption[] = projectRows;

  return (
    <InvoicesView
      invoices={invoiceList}
      clients={clientOptions}
      projects={projectOptions}
      defaultTaxRate={settings.taxRate ?? "0"}
    />
  );
}
