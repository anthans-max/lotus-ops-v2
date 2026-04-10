"use client";

import { useState, useTransition } from "react";
import { updateSettings, uploadLogo, type AppSettings } from "@/app/actions/settings";

export function SettingsForm({ settings }: { settings: AppSettings }) {
  // Company
  const [companyName, setCompanyName] = useState(settings.companyName ?? "");
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress ?? "");
  const [companyEmail, setCompanyEmail] = useState(settings.companyEmail ?? "");
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone ?? "");
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");

  // Numbering
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix ?? "INV");
  const [invoiceStartNumber, setInvoiceStartNumber] = useState(String(settings.invoiceStartNumber ?? 1001));
  const [contractPrefix, setContractPrefix] = useState(settings.contractPrefix ?? "LAI");
  const [contractStartNumber, setContractStartNumber] = useState(String(settings.contractStartNumber ?? 1001));

  // Tax
  const [taxName, setTaxName] = useState(settings.taxName ?? "Tax");
  const [taxRate, setTaxRate] = useState(settings.taxRate ?? "0");
  const [taxNumber, setTaxNumber] = useState(settings.taxNumber ?? "");

  // Billing
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(String(settings.defaultPaymentTerms ?? 30));
  const [lateFeePercent, setLateFeePercent] = useState(settings.lateFeePercent ?? "0");
  const [defaultRate, setDefaultRate] = useState(settings.defaultRate ?? "0");

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSettings({
        companyName,
        companyAddress: companyAddress || undefined,
        companyEmail: companyEmail || undefined,
        companyPhone: companyPhone || undefined,
        invoicePrefix,
        invoiceStartNumber: parseInt(invoiceStartNumber) || 1001,
        contractPrefix,
        contractStartNumber: parseInt(contractStartNumber) || 1001,
        taxName,
        taxRate,
        taxNumber: taxNumber || undefined,
        defaultPaymentTerms: parseInt(defaultPaymentTerms) || 30,
        lateFeePercent,
        defaultRate,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error);
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startUploadTransition(async () => {
      const formData = new FormData();
      formData.append("logo", file);
      const result = await uploadLogo(formData);
      if (result.success) {
        setLogoUrl(result.data.url);
      } else {
        setError(result.error);
      }
    });
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-syne)",
    fontSize: "0.6rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 6,
    border: "1px solid var(--border-dark)",
    background: "var(--bg)",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
  };

  const sectionStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "20px 20px",
    marginBottom: 20,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "var(--font-cormorant)",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: 16,
  };

  return (
    <form onSubmit={handleSave}>
      {/* Company Profile */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Company Profile</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <textarea
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  style={{ height: 48, objectFit: "contain", borderRadius: 4 }}
                />
              )}
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border-dark)",
                  borderRadius: 100,
                  padding: "8px 16px",
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-jost)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  opacity: isUploading ? 0.6 : 1,
                }}
              >
                {isUploading ? "Uploading…" : logoUrl ? "Replace Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Numbering */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Invoice & Contract Numbering</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Invoice Prefix</label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="INV"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Invoice Start Number</label>
            <input
              type="number"
              min="1"
              value={invoiceStartNumber}
              onChange={(e) => setInvoiceStartNumber(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Contract Prefix</label>
            <input
              type="text"
              value={contractPrefix}
              onChange={(e) => setContractPrefix(e.target.value)}
              placeholder="LAI"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Contract Start Number</label>
            <input
              type="number"
              min="1"
              value={contractStartNumber}
              onChange={(e) => setContractStartNumber(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Tax */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Tax Configuration</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Tax Name</label>
            <input
              type="text"
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="Tax"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tax Number</label>
            <input
              type="text"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="e.g. EIN or GST number"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Billing Defaults */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Billing Defaults</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Default Payment Terms (days)</label>
            <input
              type="number"
              min="0"
              value={defaultPaymentTerms}
              onChange={(e) => setDefaultPaymentTerms(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Late Fee (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={lateFeePercent}
              onChange={(e) => setLateFeePercent(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Default Rate ($/hr)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {error && (
        <p
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            color: "var(--red)",
            marginBottom: 12,
          }}
        >
          {error}
        </p>
      )}

      {saved && (
        <p
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            color: "var(--green)",
            marginBottom: 12,
          }}
        >
          Settings saved.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          background: "var(--green)",
          color: "var(--bg)",
          border: "none",
          borderRadius: 100,
          padding: "10px 28px",
          minHeight: 44,
          fontSize: "0.72rem",
          fontFamily: "var(--font-jost)",
          fontWeight: 500,
          letterSpacing: "0.08em",
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
