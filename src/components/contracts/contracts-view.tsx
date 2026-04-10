"use client";

import { useState, useTransition } from "react";
import { ContractsTable } from "./contracts-table";
import { ContractsCards } from "./contracts-cards";
import { ContractForm, type ProjectOption } from "./contract-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteContract, type Contract } from "@/app/actions/contracts";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export type ContractWithProject = Contract & {
  projectName: string | null;
  clientName: string | null;
};

export function ContractsView({
  contracts,
  projects,
}: {
  contracts: ContractWithProject[];
  projects: ProjectOption[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContractWithProject | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteContract(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
      } else {
        setDeleteTarget(null);
        setDeleteError(result.error);
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Contracts"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/contracts/templates"
              style={{
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border-dark)",
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
              Templates
            </Link>
            <button
              onClick={() => setAddOpen(true)}
              disabled={projects.length === 0}
              title={projects.length === 0 ? "Add a project first" : undefined}
              style={{
                background: "var(--green)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 100,
                padding: "10px 20px",
                minHeight: 44,
                fontSize: "0.72rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: projects.length === 0 ? "not-allowed" : "pointer",
                opacity: projects.length === 0 ? 0.5 : 1,
              }}
            >
              + New Contract
            </button>
          </div>
        }
      />

      {deleteError && (
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
          {deleteError}
        </div>
      )}

      {contracts.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            No contracts yet
          </p>
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            {projects.length === 0 ? "Add a project first." : "Create your first contract."}
          </p>
          {projects.length > 0 && (
            <button
              onClick={() => setAddOpen(true)}
              style={{
                background: "var(--green)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 100,
                padding: "10px 24px",
                minHeight: 44,
                fontSize: "0.72rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              New Contract
            </button>
          )}
        </div>
      )}

      <ContractsTable contracts={contracts} onDelete={setDeleteTarget} />
      <ContractsCards contracts={contracts} onDelete={setDeleteTarget} />

      <ContractForm open={addOpen} onClose={() => setAddOpen(false)} projects={projects} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Contract"
        message={`Delete contract "${deleteTarget?.contractNumber}"? This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}
