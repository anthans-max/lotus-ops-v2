"use client";

import { useState, useTransition } from "react";
import { InvoicesTable } from "./invoices-table";
import { InvoicesCards } from "./invoices-cards";
import { InvoiceForm, type ClientOption, type ProjectOption } from "./invoice-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteInvoice, type Invoice } from "@/app/actions/invoices";

export type InvoiceWithClient = Invoice & {
  clientName: string | null;
  projectName: string | null;
};

export function InvoicesView({
  invoices,
  clients,
  projects,
  defaultTaxRate,
}: {
  invoices: InvoiceWithClient[];
  clients: ClientOption[];
  projects: ProjectOption[];
  defaultTaxRate?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceWithClient | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteInvoice(deleteTarget.id);
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          Invoices
        </h1>
        <button
          onClick={() => setAddOpen(true)}
          disabled={clients.length === 0}
          title={clients.length === 0 ? "Add a client first" : undefined}
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
            cursor: clients.length === 0 ? "not-allowed" : "pointer",
            opacity: clients.length === 0 ? 0.5 : 1,
          }}
        >
          + New Invoice
        </button>
      </div>

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

      {/* Empty State */}
      {invoices.length === 0 && (
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
            No invoices yet
          </p>
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            {clients.length === 0 ? "Add a client first." : "Create your first invoice."}
          </p>
          {clients.length > 0 && (
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
              New Invoice
            </button>
          )}
        </div>
      )}

      <InvoicesTable invoices={invoices} onDelete={setDeleteTarget} />
      <InvoicesCards invoices={invoices} onDelete={setDeleteTarget} />

      <InvoiceForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        clients={clients}
        projects={projects}
        defaultTaxRate={defaultTaxRate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        message={`Delete invoice "${deleteTarget?.invoiceNumber}"? This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}
