ALTER TABLE "guilds" ALTER COLUMN "templateChannelID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "guildVerificationSettings" ALTER COLUMN "checkinInstructionMessageID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "guildVerificationSettings" ADD COLUMN "verificationInstructionChannelID" varchar(30);