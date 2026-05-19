ALTER TABLE "ai_sources" ADD COLUMN "sourceId" uuid;--> statement-breakpoint
ALTER TABLE "ai_sources" ADD CONSTRAINT "ai_sources_sourceId_sources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_sources_sourceId_idx" ON "ai_sources" USING btree ("sourceId");
