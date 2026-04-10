export const dynamic = "force-dynamic";

import { db } from "@/db";
import { timeEntries, projects, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { TimeTrackingView, type TimeEntryWithProject } from "@/components/time-tracking/time-tracking-view";

export default async function TimeTrackingPage() {
  const [entryRows, projectRows] = await Promise.all([
    db
      .select({
        id: timeEntries.id,
        projectId: timeEntries.projectId,
        date: timeEntries.date,
        hours: timeEntries.hours,
        rate: timeEntries.rate,
        description: timeEntries.description,
        status: timeEntries.status,
        invoiceId: timeEntries.invoiceId,
        createdAt: timeEntries.createdAt,
        updatedAt: timeEntries.updatedAt,
        projectName: projects.name,
        clientName: clients.name,
      })
      .from(timeEntries)
      .leftJoin(projects, eq(projects.id, timeEntries.projectId))
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .orderBy(desc(timeEntries.date), desc(timeEntries.createdAt)),

    db
      .select({ id: projects.id, name: projects.name, clientId: projects.clientId, defaultRate: projects.defaultRate })
      .from(projects)
      .where(eq(projects.status, "active"))
      .orderBy(projects.name),
  ]);

  const entries: TimeEntryWithProject[] = entryRows.map((r) => ({
    ...r,
    projectName: r.projectName ?? null,
    clientName: r.clientName ?? null,
  }));

  return <TimeTrackingView entries={entries} projectOptions={projectRows} />;
}
