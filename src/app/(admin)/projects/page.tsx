export const dynamic = "force-dynamic";

import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ProjectsView, type ProjectWithClient } from "@/components/projects/projects-view";
import type { ClientOption } from "@/components/projects/project-form";

export default async function ProjectsPage() {
  const [projectRows, clientRows] = await Promise.all([
    db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        billingType: projects.billingType,
        defaultRate: projects.defaultRate,
        budgetHours: projects.budgetHours,
        budgetAmount: projects.budgetAmount,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientName: clients.name,
      })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .orderBy(desc(projects.createdAt)),

    db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(eq(clients.status, "active"))
      .orderBy(clients.name),
  ]);

  const projectsWithClient: ProjectWithClient[] = projectRows.map((r) => ({
    ...r,
    clientName: r.clientName ?? null,
  }));

  const clientOptions: ClientOption[] = clientRows;

  return <ProjectsView projects={projectsWithClient} clients={clientOptions} />;
}
