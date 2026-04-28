"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  sendInvoice,
  voidInvoice,
  recordPayment,
  addLineItem,
  updateLineItem,
  deleteLineItem,
  attachFileToInvoice,
  detachFileFromInvoice,
  type Invoice,
  type InvoiceLineItem,
} from "@/app/actions/invoices";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ATTACHMENT_ACCEPT = "application/pdf,image/png,image/jpeg,image/webp";
const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024;

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [attachmentStatus, setAttachmentStatus] = useState<string | null>(null);
  const [attachmentBusy, setAttachmentBusy] = useState<null | "view" | "download" | "remove">(null);

  const handleDownload = async () => {
    setError(null);
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/pdf/invoice/${invoice.id}`);
      if (!res.ok) {
        setError(`Failed to generate PDF (${res.status}).`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

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

  const handlePickFile = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    setError(null);
    if (file.size > ATTACHMENT_MAX_BYTES) {
      setError("File exceeds 20 MB.");
      return;
    }
    setUploading(true);
    try {
      const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${invoice.id}/${Date.now()}-${sanitized}`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("invoice-docs")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      const result = await attachFileToInvoice(invoice.id, {
        filePath: path,
        fileSize: file.size,
        mimeType: file.type,
      });
      if (!result.success) {
        // Best-effort rollback of the orphan storage object.
        await supabase.storage.from("invoice-docs").remove([path]);
        setError(result.error);
        return;
      }
      setAttachmentStatus("Uploaded");
      setTimeout(() => setAttachmentStatus(null), 3000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fetchAttachmentUrl = async (download: boolean): Promise<string | null> => {
    setError(null);
    const res = await fetch(
      `/api/invoices/${invoice.id}/signed-url${download ? "?download=1" : ""}`
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not generate link.");
      return null;
    }
    const body = await res.json();
    return body.url as string;
  };

  const handleViewAttachment = async () => {
    setAttachmentBusy("view");
    try {
      const url = await fetchAttachmentUrl(false);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setAttachmentBusy(null);
    }
  };

  const handleDownloadAttachment = async () => {
    setAttachmentBusy("download");
    try {
      const url = await fetchAttachmentUrl(true);
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setAttachmentBusy(null);
    }
  };

  const handleRemoveAttachment = async () => {
    if (!confirm("Remove the attached file from this invoice?")) return;
    setAttachmentBusy("remove");
    setError(null);
    try {
      const result = await detachFileFromInvoice(invoice.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAttachmentStatus("Removed");
      setTimeout(() => setAttachmentStatus(null), 3000);
    } finally {
      setAttachmentBusy(null);
    }
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
          <button
            onClick={handleDownload}
            disabled={isDownloading}
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
              cursor: isDownloading ? "not-allowed" : "pointer",
              opacity: isDownloading ? 0.7 : 1,
            }}
          >
            {isDownloading ? "Downloading…" : "Download PDF"}
          </button>
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

      {/* Attachment */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ ...labelStyle, marginBottom: 0 }}>Attachment</span>
        {invoice.filePath ? (
          <>
            <span
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 13,
                color: "var(--text)",
                wordBreak: "break-all",
              }}
            >
              {invoice.filePath.split("/").pop()}
              {typeof invoice.fileSize === "number" && (
                <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
                  ({(invoice.fileSize / 1024).toFixed(0)} KB)
                </span>
              )}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={handleViewAttachment}
                disabled={attachmentBusy !== null || uploading}
                style={{
                  background: "var(--green)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 100,
                  padding: "8px 14px",
                  fontFamily: "var(--font-jost)",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor: attachmentBusy ? "not-allowed" : "pointer",
                  opacity: attachmentBusy === "view" ? 0.7 : 1,
                }}
              >
                {attachmentBusy === "view" ? "Opening…" : "View"}
              </button>
              <button
                onClick={handleDownloadAttachment}
                disabled={attachmentBusy !== null || uploading}
                style={{
                  background: "var(--green)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 100,
                  padding: "8px 14px",
                  fontFamily: "var(--font-jost)",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor: attachmentBusy ? "not-allowed" : "pointer",
                  opacity: attachmentBusy === "download" ? 0.7 : 1,
                }}
              >
                {attachmentBusy === "download" ? "Preparing…" : "Download"}
              </button>
              <button
                onClick={handlePickFile}
                disabled={uploading || attachmentBusy !== null}
                style={{
                  background: "transparent",
                  color: "var(--text)",
                  border: "1px solid var(--border-dark)",
                  borderRadius: 100,
                  padding: "8px 14px",
                  fontFamily: "var(--font-jost)",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                {uploading ? "Uploading…" : "Replace"}
              </button>
              <button
                onClick={handleRemoveAttachment}
                disabled={uploading || attachmentBusy !== null}
                style={{
                  background: "transparent",
                  color: "var(--red)",
                  border: "1px solid var(--red)",
                  borderRadius: 100,
                  padding: "8px 14px",
                  fontFamily: "var(--font-jost)",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor: attachmentBusy ? "not-allowed" : "pointer",
                  opacity: attachmentBusy === "remove" ? 0.7 : 1,
                }}
              >
                {attachmentBusy === "remove" ? "Removing…" : "Remove"}
              </button>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text-muted)" }}>
              No file attached
            </span>
            <button
              onClick={handlePickFile}
              disabled={uploading}
              style={{
                marginLeft: "auto",
                background: "var(--green)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "8px 14px",
                fontFamily: "var(--font-jost)",
                fontSize: "0.68rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? "Uploading…" : "Upload File"}
            </button>
          </>
        )}
        {attachmentStatus && (
          <span
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 12,
              color: "var(--green)",
              marginLeft: 8,
            }}
          >
            {attachmentStatus}
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ATTACHMENT_ACCEPT}
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
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
