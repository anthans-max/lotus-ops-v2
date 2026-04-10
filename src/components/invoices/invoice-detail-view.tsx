"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  sendInvoice,
  voidInvoice,
  recordPayment,
  addLineItem,
  updateLineItem,
  deleteLineItem,
  type Invoice,
  type InvoiceLineItem,
} from "@/app/actions/invoices";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    draft: { bg: "var(--tan)", color: "var(--text-dim)" },
    sent: { bg: "var(--accent-pale)", color: "var(--accent)" },
    paid: { bg: "var(--green-pale)", color: "var(--green)" },
    overdue: { bg: "var(--red-pale)", color: "var(--red)" },
    void: { bg: "var(--tan)", color: "var(--text-muted)" },
  };
  const s = status ?? "draft";
  const style = map[s] ?? map.draft;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: 100,
        padding: "4px 12px",
        fontSize: "0.65rem",
        fontFamily: "var(--font-syne)",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {s}
    </span>
  );
}

export type InvoiceDetailData = Invoice & {
  clientName: string | null;
  clientAddress: string | null;
  clientEmail: string | null;
  projectName: string | null;
  lineItems: InvoiceLineItem[];
  taxName: string;
};

export function InvoiceDetailView({ invoice }: { invoice: InvoiceDetailData }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendInvoice(invoice.id);
      if (!result.success) setError(result.error);
    });
  };

  const handleEmail = async () => {
    setEmailStatus("Sending…");
    setError(null);
    try {
      const res = await fetch(`/api/email/invoice/${invoice.id}`, { method: "POST" });
      const data = await res.json();
      if (data.sent) {
        setEmailStatus("Sent!");
        setTimeout(() => setEmailStatus(null), 3000);
      } else {
        setEmailStatus(null);
        setError(data.error ?? "Email failed.");
      }
    } catch {
      setEmailStatus(null);
      setError("Failed to send email.");
    }
  };

  const handleRecordPayment = () => {
    if (!paymentAmount) return;
    startTransition(async () => {
      const result = await recordPayment(invoice.id, paymentAmount);
      if (result.success) {
        setPaymentAmount("");
        setShowPayment(false);
      } else {
        setError(result.error);
      }
    });
  };

  const handleVoid = () => {
    startTransition(async () => {
      await voidInvoice(invoice.id);
      setVoidOpen(false);
    });
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-syne)",
    fontSize: "0.58rem",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    display: "block",
    marginBottom: 4,
  };

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontFamily: "var(--font-syne)",
    fontSize: "0.58rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text)",
    borderTop: "1px solid var(--border)",
  };

  return (
    <div style={{ paddingTop: 20 }}>
      {/* Back link */}
      <Link
        href="/invoices"
        style={{
          fontFamily: "var(--font-jost)",
          fontSize: 12,
          color: "var(--text-muted)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        ← Invoices
      </Link>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.6rem",
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            {invoice.invoiceNumber}
          </h1>
          <StatusBadge status={invoice.status} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href={`/api/pdf/invoice/${invoice.id}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "var(--green)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 100,
              padding: "10px 16px",
              minHeight: 44,
              fontSize: "0.68rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Download PDF
          </a>
          {invoice.status === "draft" && (
            <button
              onClick={handleSend}
              disabled={isPending}
              style={{
                background: "var(--green)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "10px 16px",
                minHeight: 44,
                fontSize: "0.68rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              Mark as Sent
            </button>
          )}
          {(invoice.status === "draft" || invoice.status === "sent") && invoice.clientEmail && (
            <button
              onClick={handleEmail}
              disabled={!!emailStatus}
              style={{
                background: "var(--green)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 100,
                padding: "10px 16px",
                minHeight: 44,
                fontSize: "0.68rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: emailStatus ? "not-allowed" : "pointer",
                opacity: emailStatus ? 0.7 : 1,
              }}
            >
              {emailStatus ?? "Email to Client"}
            </button>
          )}
          {invoice.status === "sent" && (
            <button
              onClick={() => setShowPayment(true)}
              style={{
                background: "var(--green)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "10px 16px",
                minHeight: 44,
                fontSize: "0.68rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              Record Payment
            </button>
          )}
          {invoice.status !== "void" && invoice.status !== "paid" && (
            <button
              onClick={() => setVoidOpen(true)}
              style={{
                background: "var(--green)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "10px 16px",
                minHeight: 44,
                fontSize: "0.68rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              Void
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "var(--red-pale)",
            border: "1px solid var(--red)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            color: "var(--red)",
          }}
        >
          {error}
        </div>
      )}

      {/* Record Payment Inline */}
      {showPayment && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>
            Record Payment:
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Amount"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--border-dark)",
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              width: 140,
            }}
          />
          <button
            onClick={handleRecordPayment}
            disabled={isPending}
            style={{
              background: "var(--green)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 100,
              padding: "8px 16px",
              fontSize: "0.68rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={() => setShowPayment(false)}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "none",
              fontFamily: "var(--font-jost)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 20,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <span style={labelStyle}>Client</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>
            {invoice.clientName ?? "—"}
          </p>
          {invoice.clientEmail && (
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)" }}>
              {invoice.clientEmail}
            </p>
          )}
        </div>
        {invoice.projectName && (
          <div>
            <span style={labelStyle}>Project</span>
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>
              {invoice.projectName}
            </p>
          </div>
        )}
        <div>
          <span style={labelStyle}>Issue Date</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>
            {invoice.issueDate}
          </p>
        </div>
        <div>
          <span style={labelStyle}>Due Date</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>
            {invoice.dueDate}
          </p>
        </div>
        <div>
          <span style={labelStyle}>Total</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
            ${Number(invoice.total ?? 0).toFixed(2)}
          </p>
        </div>
        {Number(invoice.paidAmount) > 0 && (
          <div>
            <span style={labelStyle}>Paid</span>
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--green)", fontWeight: 500 }}>
              ${Number(invoice.paidAmount).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 12,
          }}
        >
          Line Items
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--tan)" }}>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Qty</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Rate</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.description}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{Number(item.quantity ?? 1).toFixed(2)}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>${Number(item.rate).toFixed(2)}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>${Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: 220 }}>
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text-muted)" }}>Subtotal</span>
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>${Number(invoice.subtotal ?? 0).toFixed(2)}</span>
          </div>
          {Number(invoice.taxAmount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", width: 220 }}>
              <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text-muted)" }}>{invoice.taxName}</span>
              <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>${Number(invoice.taxAmount).toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", width: 220, borderTop: "1px solid var(--border)", paddingTop: 6 }}>
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Total</span>
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>${Number(invoice.total ?? 0).toFixed(2)}</span>
          </div>
          {Number(invoice.paidAmount) > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", width: 220 }}>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--green)" }}>Paid</span>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--green)" }}>${Number(invoice.paidAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: 220 }}>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, fontWeight: 600, color: "var(--red)" }}>Balance Due</span>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, fontWeight: 600, color: "var(--red)" }}>${(Number(invoice.total) - Number(invoice.paidAmount)).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {invoice.notes && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <span style={labelStyle}>Notes</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
            {invoice.notes}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={voidOpen}
        onClose={() => setVoidOpen(false)}
        onConfirm={handleVoid}
        title="Void Invoice"
        message={`Void invoice ${invoice.invoiceNumber}? This cannot be undone.`}
        confirmLabel="Void"
        loading={isPending}
      />
    </div>
  );
}
