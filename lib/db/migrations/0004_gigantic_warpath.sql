CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"display_name" text,
	"initial_message" text,
	"dismissal_message" text,
	"system_prompt" text,
	"model" text,
	"temperature" real,
	"is_private" boolean DEFAULT false,
	"vanity" text,
	"description" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "agents_vanity_unique" UNIQUE("vanity")
);
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;