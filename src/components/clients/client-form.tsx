"use client";

import { useTransition, useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createClient, updateClient, type Client } from "@/app/actions/clients";

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

export function ClientForm({
  open,
  onClose,
  client,
}: {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email ?? "");
      setPhone(client.phone ?? "");
      setAddress(client.address ?? "");
      setPaymentTerms(String(client.paymentTerms ?? 30));
      setStatus(client.status ?? "active");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPaymentTerms("30");
      setStatus("active");
    }
    setError(null);
  }, [client, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = client
        ? await updateClient(client.id, {
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
            paymentTerms: parseInt(paymentTerms) || 30,
            status,
          })
        : await createClient({
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
            paymentTerms: parseInt(paymentTerms) || 30,
            status,
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
      title={client ? "Edit Client" : "Add Client"}
      className="dialog-fullscreen"
    >
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name"
            required
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

        <div style={fieldStyle}>
          <label style={labelStyle}>Address</label>
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, State"
            rows={2}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Payment Terms (days)</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Status</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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
            {isPending ? "Saving..." : client ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
