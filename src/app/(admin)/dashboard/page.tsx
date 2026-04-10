export const dynamic = "force-dynamic";

import { db } from "@/db";
import { clients, projects, invoices, timeEntries, contracts } from "@/db/schema";
import { eq, sql, and, isNull, desc, inArray } from "drizzle-orm";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [
    [{ activeClients }],
    [{ activeProjects }],
    openInvoiceRows,
    [{ uninvoicedHours }],
    [{ revenueMonth }],
    [{ overdueCount }],
    recentInvoices,
    recentContracts,
    recentTimeEntries,
  ] = await Promise.all([
    db.select({ activeClients: sql<number>`count(*)` }).from(clients).where(eq(clients.status, "active")),
    db.select({ activeProjects: sql<number>`count(*)` }).from(projects).where(eq(projects.status, "active")),
    db.select({ count: sql<number>`count(*)`, total: sql<string>`coalesce(sum(${invoices.total}), 0)` })
      .from(invoices)
      .where(inArray(invoices.status, ["draft", "sent", "overdue"])),
    db.select({ uninvoicedHours: sql<string>`coalesce(sum(${timeEntries.hours}), 0)` })
      .from(timeEntries)
      .where(and(eq(timeEntries.status, "approved"), isNull(timeEntries.invoiceId as any))),
    db.select({ revenueMonth: sql<string>`coalesce(sum(${invoices.paidAmount}), 0)` })
      .from(invoices)
      .where(and(eq(invoices.status, "paid"), sql`${invoices.issueDate} >= ${monthStartStr}`)),
    db.select({ overdueCount: sql<number>`count(*)` })
      .from(invoices)
      .where(and(eq(invoices.status, "sent"), sql`${invoices.dueDate} < ${today}`)),
    db.select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber, status: invoices.status, total: invoices.total, createdAt: invoices.createdAt })
      .from(invoices).orderBy(desc(invoices.createdAt)).limit(5),
    db.select({ id: contracts.id, contractNumber: contracts.contractNumber, status: contracts.status, createdAt: contracts.createdAt })
      .from(contracts).orderBy(desc(contracts.createdAt)).limit(5),
    db.select({ id: timeEntries.id, date: timeEntries.date, hours: timeEntries.hours, status: timeEntries.status, createdAt: timeEntries.createdAt })
      .from(timeEntries).orderBy(desc(timeEntries.createdAt)).limit(5),
  ]);

  const openCount = Number(openInvoiceRows[0]?.count ?? 0);
  const openTotal = Number(openInvoiceRows[0]?.total ?? 0);

  const activityItems: ActivityItem[] = [
    ...recentInvoices.map((inv) => ({
      id: `inv-${inv.id}`,
      type: "invoice" as const,
      label: inv.invoiceNumber,
      sub: `Invoice · $${Number(inv.total ?? 0).toFixed(2)} · ${inv.status}`,
      href: `/invoices/${inv.id}`,
      date: inv.createdAt,
    })),
    ...recentContracts.map((c) => ({
      id: `con-${c.id}`,
      type: "contract" as const,
      label: c.contractNumber,
      sub: `Contract · ${c.status}`,
      href: `/contracts/${c.id}`,
      date: c.createdAt,
    })),
    ...recentTimeEntries.map((te) => ({
      id: `te-${te.id}`,
      type: "time" as const,
      label: `${Number(te.hours).toFixed(2)} hrs`,
      sub: `Time Entry · ${te.date} · ${te.status}`,
      href: `/time-tracking`,
      date: te.createdAt,
    })),
  ]
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, 10);

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <MetricCard label="Active Clients" value={String(activeClients)} />
        <MetricCard label="Active Projects" value={String(activeProjects)} />
        <MetricCard
          label="Open Invoices"
          value={String(openCount)}
          sub={`$${openTotal.toFixed(2)} outstanding`}
          accent={openCount > 0 ? "accent" : undefined}
        />
        <MetricCard
          label="Approved Hours"
          value={`${Number(uninvoicedHours).toFixed(1)}`}
          sub="uninvoiced"
        />
        <MetricCard
          label="Revenue This Month"
          value={`$${Number(revenueMonth).toFixed(0)}`}
          accent="green"
        />
        <MetricCard
          label="Overdue Invoices"
          value={String(overdueCount)}
          accent={Number(overdueCount) > 0 ? "red" : undefined}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 28 }}>
        <QuickActions />
      </div>

      {/* Activity Feed */}
      <ActivityFeed items={activityItems} />
    </div>
  );
}
