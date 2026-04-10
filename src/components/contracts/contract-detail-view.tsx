"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateContractStatus, type Contract } from "@/app/actions/contracts";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    draft: { bg: "var(--tan)", color: "var(--text-dim)" },
    sent: { bg: "var(--accent-pale)", color: "var(--accent)" },
    signed: { bg: "var(--green-pale)", color: "var(--green)" },
    expired: { bg: "var(--red-pale)", color: "var(--red)" },
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

export type ContractDetailData = Contract & {
  projectName: string | null;
  clientName: string | null;
};

export function ContractDetailView({ contract }: { contract: ContractDetailData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatus = (status: string) => {
    startTransition(async () => {
      const result = await updateContractStatus(contract.id, status);
      if (!result.success) setError(result.error);
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

  return (
    <div style={{ paddingTop: 20 }}>
      <Link
        href="/contracts"
        style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: 16 }}
      >
        ← Contracts
      </Link>

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
            {contract.contractNumber}
          </h1>
          <StatusBadge status={contract.status} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {contract.pdfUrl && (
            <a
              href={contract.pdfUrl}
              target="_blank"
              rel="noreferrer"
              style={{ background: "var(--green-pale)", color: "var(--green)", border: "1px solid var(--green)", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              View PDF
            </a>
          )}
          {contract.status === "draft" && (
            <button
              onClick={() => handleStatus("sent")}
              disabled={isPending}
              style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: isPending ? "not-allowed" : "pointer" }}
            >
              Mark Sent
            </button>
          )}
          {contract.status === "sent" && (
            <button
              onClick={() => handleStatus("signed")}
              disabled={isPending}
              style={{ background: "var(--green-pale)", color: "var(--green)", border: "1px solid var(--green)", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: isPending ? "not-allowed" : "pointer" }}
            >
              Mark Signed
            </button>
          )}
          {(contract.status === "draft" || contract.status === "sent") && (
            <button
              onClick={() => handleStatus("expired")}
              disabled={isPending}
              style={{ background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: isPending ? "not-allowed" : "pointer" }}
            >
              Mark Expired
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--red-pale)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--red)" }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 20,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <div>
          <span style={labelStyle}>Project</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>{contract.projectName ?? "—"}</p>
        </div>
        <div>
          <span style={labelStyle}>Client</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>{contract.clientName ?? "—"}</p>
        </div>
        <div>
          <span style={labelStyle}>Created</span>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>
            {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>
        {contract.sentAt && (
          <div>
            <span style={labelStyle}>Sent</span>
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)" }}>
              {new Date(contract.sentAt).toLocaleDateString()}
            </p>
          </div>
        )}
        {contract.signedAt && (
          <div>
            <span style={labelStyle}>Signed</span>
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--green)", fontWeight: 500 }}>
              {new Date(contract.signedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
