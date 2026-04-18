CREATE TABLE "portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"vanity" varchar NOT NULL,
	"photo" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"theme" varchar DEFAULT 'prizm' NOT NULL,
	"data" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_vanity_unique" UNIQUE("vanity")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "bio" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
