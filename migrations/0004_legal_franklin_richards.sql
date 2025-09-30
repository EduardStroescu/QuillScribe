ALTER TABLE "files" ADD COLUMN "last_modified_by" uuid;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "last_modified_by" uuid;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "last_modified_by" uuid;