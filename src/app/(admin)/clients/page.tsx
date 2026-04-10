export const dynamic = "force-dynamic";

import { db } from "@/db";
import { clients, projects, contacts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ClientsView, type ClientWithCounts } from "@/components/clients/clients-view";

export default async function ClientsPage() {
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      address: clients.address,
      email: clients.email,
      phone: clients.phone,
      paymentTerms: clients.paymentTerms,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      projectCount: sql<number>`count(distinct ${projects.id})`,
      contactCount: sql<number>`count(distinct ${contacts.id})`,
    })
    .from(clients)
    .leftJoin(projects, eq(projects.clientId, clients.id))
    .leftJoin(contacts, eq(contacts.clientId, clients.id))
    .groupBy(clients.id)
    .orderBy(clients.name);

  const clientsWithCounts: ClientWithCounts[] = rows.map((r) => ({
    ...r,
    projectCount: Number(r.projectCount),
    contactCount: Number(r.contactCount),
  }));

  return <ClientsView clients={clientsWithCounts} />;
}
