export const dynamic = "force-dynamic";

import { db } from "@/db";
import { contractTemplates } from "@/db/schema";
import { desc } from "drizzle-orm";
import { TemplatesView } from "@/components/contracts/templates/templates-view";

export default async function TemplatesPage() {
  const templates = await db
    .select()
    .from(contractTemplates)
    .orderBy(desc(contractTemplates.createdAt));

  return <TemplatesView templates={templates} />;
}
