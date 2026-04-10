"use client";

import { useState, useEffect, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContactForm } from "./contact-form";
import {
  getContactsForClient,
  deleteContact,
  type Contact,
} from "@/app/actions/clients";

export function ContactsSection({
  open,
  onClose,
  client,
}: {
  open: boolean;
  onClose: () => void;
  client: { id: string; name: string };
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    contact: Contact | null;
  }>({ open: false, contact: null });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const loadContacts = async () => {
    setLoading(true);
    const result = await getContactsForClient(client.id);
    if (result.success) setContacts(result.data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadContacts();
      setDeleteError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client.id]);

  const handleContactFormClose = () => {
    setAddOpen(false);
    setContactToEdit(null);
    loadContacts();
  };

  const handleDeleteConfirm = () => {
    if (!confirmDelete.contact) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteContact(confirmDelete.contact!.id);
      if (result.success) {
        setConfirmDelete({ open: false, contact: null });
        loadContacts();
      } else {
        setDeleteError(result.error);
        setConfirmDelete({ open: false, contact: null });
      }
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={`Contacts — ${client.name}`}
        className="dialog-fullscreen"
        zIndex={1000}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => setAddOpen(true)}
            style={{
              background: "var(--green)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 100,
              padding: "10px 18px",
              minHeight: 44,
              fontSize: "0.72rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            + Add Contact
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            Loading...
          </div>
        ) : contacts.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 6,
              }}
            >
              No contacts yet
            </p>
            <p
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              Add a contact to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contacts.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-jost)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {c.name}
                    </span>
                    {c.isPrimary && (
                      <span
                        style={{
                          marginLeft: 8,
                          background: "var(--green-pale)",
                          color: "var(--green)",
                          borderRadius: 100,
                          padding: "1px 8px",
                          fontSize: "0.6rem",
                          fontFamily: "var(--font-syne)",
                          fontWeight: 500,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Primary
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setContactToEdit(c)}
                      style={{
                        background: "transparent",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        borderRadius: 100,
                        padding: "4px 12px",
                        minHeight: 30,
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-jost)",
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDelete({ open: true, contact: c })
                      }
                      style={{
                        background: "var(--red-pale)",
                        color: "var(--red)",
                        border: "none",
                        borderRadius: 100,
                        padding: "4px 12px",
                        minHeight: 30,
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-jost)",
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {c.title && (
                  <p
                    style={{
                      fontFamily: "var(--font-jost)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 2,
                    }}
                  >
                    {c.title}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {c.email && (
                    <span
                      style={{
                        fontFamily: "var(--font-jost)",
                        fontSize: 12,
                        color: "var(--text-dim)",
                      }}
                    >
                      {c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span
                      style={{
                        fontFamily: "var(--font-jost)",
                        fontSize: 12,
                        color: "var(--text-dim)",
                      }}
                    >
                      {c.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteError && (
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--red)",
              marginTop: 12,
            }}
          >
            {deleteError}
          </p>
        )}
      </Dialog>

      <ContactForm
        open={addOpen || contactToEdit !== null}
        onClose={handleContactFormClose}
        clientId={client.id}
        contact={contactToEdit}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, contact: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact"
        message={`Delete ${confirmDelete.contact?.name}? This cannot be undone.`}
        loading={isDeleting}
      />
    </>
  );
}
