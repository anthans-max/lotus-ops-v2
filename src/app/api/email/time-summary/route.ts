export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { db } from "@/db";
import { timeEntries, projects, clients } from "@/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { Resend } from "resend";

type Body = {
  weekStart: string;
  weekEnd: string;
  recipientEmail: string;
  recipientName: string;
  highlights?: string;
};

export async function POST(request: Request) {
  const { weekStart, weekEnd, recipientEmail, recipientName, highlights } =
    (await request.json()) as Body;

  if (!weekStart || !weekEnd || !recipientEmail || !recipientName) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const from = process.env.RESEND_FROM;
  if (!from) {
    return Response.json(
      { error: "RESEND_FROM env var is not configured" },
      { status: 500 }
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
    .where(
      and(gte(timeEntries.date, weekStart), lte(timeEntries.date, weekEnd))
    )
    .orderBy(asc(timeEntries.date));

  const headerBg = "#2d4a3e";
  const altBg = "#f9f7f2";

  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = [r.projectName, r.clientName].filter(Boolean).join(" · ") || "—";
    const list = groups.get(key);
    if (list) list.push(r);
    else groups.set(key, [r]);
  }

  const groupsHtml = Array.from(groups.entries())
    .map(([groupLabel, groupRows]) => {
      const headingRow = `<tr><td colspan="2" style="background:${headerBg};color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;padding:8px 12px;">${escapeHtml(groupLabel)}</td></tr>`;
      const entryRows = groupRows
        .map((r, i) => {
          const bg = i % 2 === 0 ? "#ffffff" : altBg;
          const rawDesc = r.description ?? "";
          const items = rawDesc
            .split(/\s*\d+\.\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          const descHtml =
            items.length > 0
              ? `<ul style="margin:0;padding:0 0 0 16px;">${items
                  .map(
                    (it) =>
                      `<li style="margin:0 0 4px 0;font-size:13px;line-height:1.4;">${escapeHtml(it)}</li>`
                  )
                  .join("")}</ul>`
              : escapeHtml(rawDesc);
          return `<tr style="background:${bg};">
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-family:Arial,sans-serif;font-size:13px;color:#2a2a2a;">${r.date}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-family:Arial,sans-serif;font-size:13px;color:#2a2a2a;">${descHtml}</td>
      </tr>`;
        })
        .join("");
      return headingRow + entryRows;
    })
    .join("");

  const emptyRow = rows.length === 0
    ? `<tr><td colspan="2" style="padding:20px;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#777;">No time entries logged this week.</td></tr>`
    : "";

  const highlightLines = (highlights ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[•\-]\s*/, "").trim())
    .filter((line) => line.length > 0);

  const highlightsHtml =
    highlightLines.length > 0
      ? `<div style="border-left:3px solid #2d4a3e;padding-left:16px;margin-bottom:28px;">
          <div style="font-family:'Syne',Arial,sans-serif;font-size:13px;font-weight:600;color:#2d4a3e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Key Highlights</div>
          <ul style="list-style:none;padding:0;margin:0;">
            ${highlightLines
              .map(
                (line) =>
                  `<li style="color:#3d3530;font-size:14px;line-height:1.6;padding-left:16px;margin-bottom:4px;position:relative;"><span style="color:#2d4a3e;position:absolute;left:0;">•</span><span style="margin-left:4px;">${escapeHtml(line)}</span></li>`
              )
              .join("")}
          </ul>
        </div>`
      : "";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#2a2a2a;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;padding:28px;">
      <p style="font-size:15px;margin:0 0 16px 0;">Hi ${escapeHtml(recipientName)},</p>
      <p style="font-size:14px;margin:0 0 20px 0;color:#444;">Here is the weekly time summary for ${formatWeekRange(weekStart, weekEnd)}.</p>
      ${highlightsHtml}
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:${headerBg};">
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;letterSpacing:0.08em;color:#ffffff;text-transform:uppercase;">Date</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#ffffff;text-transform:uppercase;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${groupsHtml}
          ${emptyRow}
        </tbody>
      </table>
      <p style="margin-top:32px;font-family:Arial,sans-serif;font-size:11px;color:#999;text-align:center;">Sent from Lotus Ops · AaraSaan Consulting</p>
    </div>
  </body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from,
    to: [recipientEmail],
    subject: `Weekly Summary & Progress Update for ${formatWeekRange(weekStart, weekEnd)}`,
    html,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${weekEnd}T00:00:00`);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}\u2013${endDay}`;
  }
  return `${startMonth} ${startDay}\u2013${endMonth} ${endDay}`;
}
