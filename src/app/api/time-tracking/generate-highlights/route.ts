export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { db } from "@/db";
import { timeEntries, projects, clients } from "@/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";

type Body = {
  from: string;
  to: string;
};

interface AnthropicTextBlock {
  type: "text";
  text: string;
}
interface AnthropicResponse {
  content?: AnthropicTextBlock[];
}

export async function POST(request: Request) {
  const { from, to } = (await request.json()) as Body;

  if (!from || !to) {
    return Response.json(
      { error: "Missing required fields: from, to" },
      { status: 400 },
    );
  }

  const rows = await db
    .select({
      date: timeEntries.date,
      hours: timeEntries.hours,
      description: timeEntries.description,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(timeEntries)
    .leftJoin(projects, eq(projects.id, timeEntries.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(and(gte(timeEntries.date, from), lte(timeEntries.date, to)))
    .orderBy(asc(timeEntries.date));

  if (rows.length === 0) {
    return Response.json({ highlights: "" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set." },
      { status: 500 },
    );
  }

  const byDate = new Map<
    string,
    { descriptions: string[]; hours: number }
  >();
  for (const r of rows) {
    const entry = byDate.get(r.date);
    const desc = (r.description ?? "").trim();
    const hours = Number(r.hours) || 0;
    if (entry) {
      if (desc) entry.descriptions.push(desc);
      entry.hours += hours;
    } else {
      byDate.set(r.date, {
        descriptions: desc ? [desc] : [],
        hours,
      });
    }
  }

  const entriesText = Array.from(byDate.entries())
    .map(([date, { descriptions, hours }]) => {
      const label = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      const desc = descriptions.join(", ") || "(no description)";
      return `${label}: ${desc} (${hours} hrs)`;
    })
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system:
        "You are a professional consultant summarising weekly work for a client update. Be concise and results-oriented.",
      messages: [
        {
          role: "user",
          content: `Based on these time entries, write 3–5 bullet points summarising the key highlights and accomplishments for the week. Use past tense. Start each bullet with a middot (·). Return only the bullet points, no preamble.\n\n${entriesText}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return Response.json(
      { error: `Anthropic API ${res.status}: ${errText.slice(0, 200)}` },
      { status: 500 },
    );
  }

  const json = (await res.json()) as AnthropicResponse;
  const highlights =
    json.content?.find((b) => b.type === "text")?.text?.trim() ?? "";

  return Response.json({ highlights });
}
