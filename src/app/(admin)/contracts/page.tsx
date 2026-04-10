export const dynamic = "force-dynamic";

import { db } from "@/db";
import { contracts, projects, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ContractsView, type ContractWithProject } from "@/components/contracts/contracts-view";
import type { ProjectOption } from "@/components/contracts/contract-form";

export default async function ContractsPage() {
  const [contractRows, projectRows] = await Promise.all([
    db
      .select({
        id: contracts.id,
        projectId: contracts.projectId,
        templateId: contracts.templateId,
        contractNumber: contracts.contractNumber,
        status: contracts.status,
        filledVariables: contracts.filledVariables,
        customClauses: contracts.customClauses,
        pdfUrl: contracts.pdfUrl,
        signedAt: contracts.signedAt,
        sentAt: contracts.sentAt,
        createdAt: contracts.createdAt,
        updatedAt: contracts.updatedAt,
        projectName: projects.name,
        clientName: clients.name,
      })
      .from(contracts)
      .leftJoin(projects, eq(projects.id, contracts.projectId))
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .orderBy(desc(contracts.createdAt)),

    db
      .select({ id: projects.id, name: projects.name, clientId: projects.clientId, clientName: clients.name })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .where(eq(projects.status, "active"))
      .orderBy(projects.name),
  ]);

  const contractList: ContractWithProject[] = contractRows.map((r) => ({
    ...r,
    projectName: r.projectName ?? null,
    clientName: r.clientName ?? null,
  }));

  const projectOptions: ProjectOption[] = projectRows.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName ?? null,
  }));

  return <ContractsView contracts={contractList} projects={projectOptions} />;
}
