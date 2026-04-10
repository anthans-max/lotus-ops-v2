export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/db";
import { contracts, projects, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ContractDetailView, type ContractDetailData } from "@/components/contracts/contract-detail-view";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [contract] = await db
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
    .where(eq(contracts.id, id));

  if (!contract) notFound();

  const contractData: ContractDetailData = {
    ...contract,
    projectName: contract.projectName ?? null,
    clientName: contract.clientName ?? null,
  };

  return <ContractDetailView contract={contractData} />;
}
