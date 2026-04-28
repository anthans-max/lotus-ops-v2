ALTER TABLE "invoices" ADD COLUMN "file_path" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "mime_type" text;