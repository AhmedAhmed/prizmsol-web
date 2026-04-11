CREATE TABLE "collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collectionId" uuid NOT NULL,
	"chatId" uuid NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar DEFAULT '',
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"title" varchar NOT NULL,
	"content" varchar NOT NULL,
	"type" varchar NOT NULL,
	"media" varchar NOT NULL,
	"credit_cost" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"messageId" uuid NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"content" varchar NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(64) NOT NULL,
	"password" varchar(64),
	"plan" varchar DEFAULT 'free' NOT NULL,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"stripeProductId" text,
	"billingPeriodStart" timestamp,
	"billingPeriodEnd" timestamp,
	"aiCreditUsedCents" integer DEFAULT 0 NOT NULL,
	"name" text,
	"description" text,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"isAnonymous" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collectionId_collections_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;