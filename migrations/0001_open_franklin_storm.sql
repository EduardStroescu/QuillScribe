CREATE INDEX IF NOT EXISTS "collaborators_workspace_id_idx" ON "collaborators" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collaborators_user_id_idx" ON "collaborators" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "files_workspace_id_idx" ON "files" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "files_folder_id_idx" ON "files" ("folder_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "folders_workspace_id_idx" ON "folders" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_price_id_idx" ON "subscriptions" ("price_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prices_product_id_idx" ON "prices" ("product_id");