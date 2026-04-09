import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

// ── App Settings ────────────────────────────────────────────────
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  companyName: text("company_name").default("AaraSaan Consulting, Inc."),
  companyAddress: text("company_address"),
  companyEmail: text("company_email"),
  companyPhone: text("company_phone"),
  logoUrl: text("logo_url"),
  invoicePrefix: text("invoice_prefix").default("INV"),
  contractPrefix: text("contract_prefix").default("LAI"),
  invoiceStartNumber: integer("invoice_start_number").default(1001),
  contractStartNumber: integer("contract_start_number").default(1001),
  taxName: text("tax_name").default("Tax"),
  taxRate: numeric("tax_rate").default("0"),
  taxNumber: text("tax_number"),
  defaultPaymentTerms: integer("default_payment_terms").default(30),
  lateFeePercent: numeric("late_fee_percent").default("0"),
  defaultRate: numeric("default_rate").default("0"),
});

// ── Clients ─────────────────────────────────────────────────────
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  email: text("email"),
  phone: text("phone"),
  paymentTerms: integer("payment_terms").default(30),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Contacts ────────────────────────────────────────────────────
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  title: text("title"),
  email: text("email"),
  phone: text("phone"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Projects ────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "restrict",
  }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  billingType: text("billing_type").default("hourly"),
  defaultRate: numeric("default_rate"),
  budgetHours: numeric("budget_hours"),
  budgetAmount: numeric("budget_amount"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Contract Templates ──────────────────────────────────────────
export const contractTemplates = pgTable("contract_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  bodyHtml: text("body_html").notNull(),
  variables: jsonb("variables").default([]),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Contracts ───────────────────────────────────────────────────
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "restrict",
  }),
  templateId: uuid("template_id").references(() => contractTemplates.id),
  contractNumber: text("contract_number").notNull().unique(),
  status: text("status").default("draft"),
  filledVariables: jsonb("filled_variables").default({}),
  customClauses: text("custom_clauses"),
  pdfUrl: text("pdf_url"),
  signedAt: timestamp("signed_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Time Entries ────────────────────────────────────────────────
export const timeEntries = pgTable("time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "restrict",
  }),
  date: date("date").notNull(),
  hours: numeric("hours").notNull(),
  rate: numeric("rate"),
  description: text("description"),
  status: text("status").default("draft"),
  invoiceId: uuid("invoice_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Invoices ────────────────────────────────────────────────────
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "restrict",
  }),
  projectId: uuid("project_id").references(() => projects.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  status: text("status").default("draft"),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: numeric("subtotal").default("0"),
  taxAmount: numeric("tax_amount").default("0"),
  total: numeric("total").default("0"),
  paidAmount: numeric("paid_amount").default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Invoice Line Items ──────────────────────────────────────────
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, {
    onDelete: "cascade",
  }),
  description: text("description").notNull(),
  quantity: numeric("quantity").default("1"),
  rate: numeric("rate").notNull(),
  amount: numeric("amount").notNull(),
  timeEntryId: uuid("time_entry_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
