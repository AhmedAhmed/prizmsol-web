CREATE TABLE "source_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceId" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"chunkIndex" integer NOT NULL,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_sources" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "collections" CASCADE;--> statement-breakpoint
DROP TABLE "agents" CASCADE;--> statement-breakpoint
DROP TABLE "ai_sources" CASCADE;--> statement-breakpoint
ALTER TABLE "collection_items" RENAME TO "sources";--> statement-breakpoint
ALTER TABLE "sources" DROP CONSTRAINT "collection_items_collectionId_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "sources" DROP CONSTRAINT "collection_items_chatId_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "type" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "status" varchar DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "metadata" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "source_chunks" ADD CONSTRAINT "source_chunks_sourceId_sources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "source_chunks_source_idx" ON "source_chunks" USING btree ("sourceId");--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sources_userId_idx" ON "sources" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "sources" DROP COLUMN "collectionId";--> statement-breakpoint
ALTER TABLE "sources" DROP COLUMN "chatId";