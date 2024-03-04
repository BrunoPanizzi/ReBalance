DO $$ BEGIN
 CREATE TYPE "asset_type" AS ENUM('br-stock', 'br-bond', 'usa-stock', 'usa-bond', 'fixed_value');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "color" AS ENUM('orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(10) NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"wallet_id" uuid NOT NULL,
	"owner" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "feedback_type" DEFAULT 'Outros' NOT NULL,
	"message" text NOT NULL,
	"user_name" varchar(100),
	"email" varchar(200)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"ideal_percentage" real DEFAULT 0 NOT NULL,
	"color" "color" NOT NULL,
	"asset_type" "asset_type" DEFAULT 'br-stock',
	"owner" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset" ADD CONSTRAINT "asset_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset" ADD CONSTRAINT "asset_owner_user_uid_fk" FOREIGN KEY ("owner") REFERENCES "user"("uid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wallet" ADD CONSTRAINT "wallet_owner_user_uid_fk" FOREIGN KEY ("owner") REFERENCES "user"("uid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
