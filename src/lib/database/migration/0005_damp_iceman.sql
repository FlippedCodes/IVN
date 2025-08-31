ALTER TABLE "guildVerificationSettings" RENAME COLUMN "checkinMessageInstructionTemplateID" TO "checkinInstructionMessageID";--> statement-breakpoint
ALTER TABLE "guilds" ADD COLUMN "templateChannelID" varchar(30);--> statement-breakpoint
ALTER TABLE "guildVerificationSettings" DROP COLUMN "verificationInstructionChannelID";