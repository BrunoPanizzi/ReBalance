ALTER TABLE "wallet" ALTER COLUMN "asset_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "asset" ADD COLUMN "total_value" real DEFAULT 0;