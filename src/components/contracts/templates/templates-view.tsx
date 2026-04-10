"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { TemplatesTable } from "./templates-table";
import { TemplatesCards } from "./templates-cards";
import { TemplateForm } from "./template-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTemplate, type ContractTemplate } from "@/app/actions/contract-templates";

export function TemplatesView({ templates }: { templates: ContractTemplate[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ContractTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContractTemplate | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteTemplate(deleteTarget.id);
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Link
            href="/contracts"
            style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: 6 }}
          >
            ← Contracts
          </Link>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.4rem", fontWeight: 600, color: "var(--text)" }}>
            Contract Templates
          </h1>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          style={{ background: "var(--green)", color: "var(--bg)", border: "none", borderRadius: 100, padding: "10px 20px", minHeight: 44, fontSize: "0.72rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.08em", cursor: "pointer" }}
        >
          + New Template
        </button>
      </div>

      {deleteError && (
        <div style={{ background: "var(--red-pale)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--red)" }}>
          {deleteError}
        </div>
      )}

      {templates.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.3rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>No templates yet</p>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>Create a reusable contract template.</p>
          <button onClick={() => setAddOpen(true)} style={{ background: "var(--green)", color: "var(--bg)", border: "none", borderRadius: 100, padding: "10px 24px", minHeight: 44, fontSize: "0.72rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.08em", cursor: "pointer" }}>New Template</button>
        </div>
      )}

      <TemplatesTable templates={templates} onEdit={setEditTarget} onDelete={setDeleteTarget} />
      <TemplatesCards templates={templates} onEdit={setEditTarget} onDelete={setDeleteTarget} />

      <TemplateForm open={addOpen} onClose={() => setAddOpen(false)} template={null} />
      <TemplateForm open={editTarget !== null} onClose={() => setEditTarget(null)} template={editTarget} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}
