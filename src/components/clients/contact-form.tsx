"use client";

import { useTransition, useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createContact, updateContact, type Contact } from "@/app/actions/clients";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font-jost)",
  fontSize: 13,
  color: "var(--text)",
  outline: "none",
  minHeight: 44,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-syne)",
  fontSize: "0.6rem",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = { marginBottom: 16 };

export function ContactForm({
  open,
  onClose,
  clientId,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  contact?: Contact | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setTitle(contact.title ?? "");
      setEmail(contact.email ?? "");
      setPhone(contact.phone ?? "");
      setIsPrimary(contact.isPrimary ?? false);
    } else {
      setName("");
      setTitle("");
      setEmail("");
      setPhone("");
      setIsPrimary(false);
    }
    setError(null);
  }, [contact, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Contact name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = contact
        ? await updateContact(contact.id, {
            clientId,
            name: name.trim(),
            title: title.trim() || undefined,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            isPrimary,
          })
        : await createContact({
            clientId,
            name: name.trim(),
            title: title.trim() || undefined,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            isPrimary,
          });

      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={contact ? "Edit Contact" : "Add Contact"}
      className="dialog-fullscreen"
      zIndex={1010}
    >
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Title</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CEO, Project Manager"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Phone</label>
          <input
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            id="isPrimary"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            style={{ width: 16, height: 16, cursor: "pointer" }}
          />
          <label
            htmlFor="isPrimary"
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-dim)",
              cursor: "pointer",
            }}
          >
            Primary contact
          </label>
        </div>

        {error && (
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--red)",
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              background: "transparent",
              color: "var(--text-dim)",
              border: "1px solid var(--border-dark)",
              borderRadius: 100,
              padding: "10px 20px",
              minHeight: 44,
              fontSize: "0.72rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
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
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Saving..." : contact ? "Save Changes" : "Add Contact"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
