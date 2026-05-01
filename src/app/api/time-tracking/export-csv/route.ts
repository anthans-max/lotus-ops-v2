export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/db";
import { timeEntries, projects, clients } from "@/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
    return Response.json(
      { error: "from and to must be YYYY-MM-DD strings" },
      { status: 400 }
    );
  }

  const rows = await db
    .select({
      date: timeEntries.date,
      hours: timeEntries.hours,
      description: timeEntries.description,
      createdAt: timeEntries.createdAt,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(timeEntries)
    .leftJoin(projects, eq(projects.id, timeEntries.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(and(gte(timeEntries.date, from), lte(timeEntries.date, to)))
    .orderBy(asc(timeEntries.date), asc(timeEntries.createdAt));

  const byDate = new Map<
    string,
    { totalHours: number; tasks: string[] }
  >();
  for (const r of rows) {
    const entry = byDate.get(r.date);
    const hours = Number(r.hours);
    const desc = (r.description ?? "").trim();
    if (entry) {
      entry.totalHours += hours;
      if (desc) entry.tasks.push(desc);
    } else {
      byDate.set(r.date, {
        totalHours: hours,
        tasks: desc ? [desc] : [],
      });
    }
  }

  const header = "Date,Day,Total Hours,Tasks";
  const lines = [header];
  for (const [date, { totalHours, tasks }] of byDate) {
    const day = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const hours = totalHours.toFixed(2);
    const tasksJoined = tasks.join(" | ");
    lines.push(
      [csvField(date), csvField(day), csvField(hours), csvField(tasksJoined)].join(",")
    );
  }

  const csv = lines.join("\n");
  const filename = `time-report-${from.slice(0, 7)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
