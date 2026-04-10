"use client";

import { useState, useTransition } from "react";
import { ClientsTable } from "./clients-table";
import { ClientsCards } from "./clients-cards";
import { ClientForm } from "./client-form";
import { ContactsSection } from "./contacts-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteClient, type Client } from "@/app/actions/clients";

export type ClientWithCounts = Client & {
  projectCount: number;
  contactCount: number;
};

export function ClientsView({ clients }: { clients: ClientWithCounts[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ClientWithCounts | null>(null);
  const [contactsTarget, setContactsTarget] =
    useState<ClientWithCounts | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ClientWithCounts | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteClient(deleteTarget.id);
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
          Clients
        </h1>
        <button
          onClick={() => setAddOpen(true)}
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
            cursor: "pointer",
          }}
        >
          + Add Client
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

      {/* Empty state */}
      {clients.length === 0 && (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            No clients yet
          </p>
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            Add your first client to get started.
          </p>
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
            Add Client
          </button>
        </div>
      )}

      <ClientsTable
        clients={clients}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onContacts={setContactsTarget}
      />

      <ClientsCards
        clients={clients}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onContacts={setContactsTarget}
      />

      {/* Dialogs */}
      <ClientForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        client={null}
      />

      <ClientForm
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        client={editTarget}
      />

      {contactsTarget && (
        <ContactsSection
          open={contactsTarget !== null}
          onClose={() => setContactsTarget(null)}
          client={contactsTarget}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        message={`Delete ${deleteTarget?.name}? This will also remove all their contacts. This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}
