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
};

export async function POST(request: Request) {
  const { weekStart, weekEnd, recipientEmail, recipientName } =
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

  const totalHours = rows.reduce((sum, r) => sum + parseFloat(r.hours), 0);

  const headerBg = "#2d4a3e";
  const altBg = "#f9f7f2";
  const rowsHtml = rows
    .map((r, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : altBg;
      const project = [r.projectName, r.clientName].filter(Boolean).join(" · ");
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
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-family:Arial,sans-serif;font-size:13px;color:#2a2a2a;">${escapeHtml(project || "—")}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-family:Arial,sans-serif;font-size:13px;color:#2a2a2a;text-align:right;">${parseFloat(r.hours).toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-family:Arial,sans-serif;font-size:13px;color:#2a2a2a;">${descHtml}</td>
      </tr>`;
    })
    .join("");

  const emptyRow = rows.length === 0
    ? `<tr><td colspan="4" style="padding:20px;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#777;">No time entries logged this week.</td></tr>`
    : "";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#2a2a2a;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;padding:28px;">
      <p style="font-size:15px;margin:0 0 16px 0;">Hi ${escapeHtml(recipientName)},</p>
      <p style="font-size:14px;margin:0 0 20px 0;color:#444;">Here is the weekly time summary for ${weekStart} – ${weekEnd}.</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:${headerBg};">
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;letterSpacing:0.08em;color:#ffffff;text-transform:uppercase;">Date</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#ffffff;text-transform:uppercase;">Project</th>
            <th style="padding:10px 12px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#ffffff;text-transform:uppercase;">Hours</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#ffffff;text-transform:uppercase;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          ${emptyRow}
        </tbody>
        <tfoot>
          <tr style="background:${altBg};">
            <td colspan="2" style="padding:12px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#2a2a2a;text-align:right;">Total</td>
            <td style="padding:12px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#2a2a2a;text-align:right;">${totalHours.toFixed(2)}</td>
            <td style="padding:12px;"></td>
          </tr>
          <tr>
            <td colspan="4" style="padding:6px 12px 0 12px;font-family:Arial,sans-serif;font-size:11px;color:#888;text-align:right;">Retainer: 20 hrs/week</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:32px;font-family:Arial,sans-serif;font-size:11px;color:#999;text-align:center;">Sent from Lotus Ops · AaraSaan Consulting</p>
    </div>
  </body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from,
    to: [recipientEmail],
    subject: `Weekly Update: ${weekStart} – ${weekEnd} | AaraSaan Consulting`,
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
