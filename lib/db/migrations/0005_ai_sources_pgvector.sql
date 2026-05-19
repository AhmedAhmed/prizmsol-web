CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "ai_sources" RENAME COLUMN "projectId" TO "userId";--> statement-breakpoint
ALTER TABLE "ai_sources" DROP CONSTRAINT "ai_sources_projectId_user_id_fk";--> statement-breakpoint
ALTER TABLE "ai_sources" ADD CONSTRAINT "ai_sources_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_sources" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "ai_sources" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ai_sources" ALTER COLUMN "content" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ai_sources" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "ai_sources" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
CREATE INDEX "ai_sources_userId_idx" ON "ai_sources" USING btree ("userId");
