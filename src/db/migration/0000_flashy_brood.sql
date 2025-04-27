CREATE TABLE "guildSettingCheckinRoles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guildSettingCheckinRoles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildSettingID" varchar(30) NOT NULL,
	"checkinRoleID" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guildSettingCheckinRoles_guildSettingID_checkinRoleID_unique" UNIQUE("guildSettingID","checkinRoleID")
);
--> statement-breakpoint
CREATE TABLE "guildSettingIgnoreChannels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guildSettingIgnoreChannels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildSettingID" varchar(30) NOT NULL,
	"ignoreChannelID" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guildSettingIgnoreChannels_guildSettingID_ignoreChannelID_unique" UNIQUE("guildSettingID","ignoreChannelID")
);
--> statement-breakpoint
CREATE TABLE "guildSettings" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"guildID" varchar(30) NOT NULL,
	"teamRoleID" varchar(30) NOT NULL,
	"hideOpenChannelsRoleID" varchar(30) NOT NULL,
	"kickoffEmoji" varchar(1) NOT NULL,
	"kickoffChannelID" varchar(30) NOT NULL,
	"kickoffMessageID" varchar(30) NOT NULL,
	"categoryID" varchar(30) NOT NULL,
	"guildWelcomeChannelID" varchar(30) NOT NULL,
	"archiveChannelID" varchar(30) NOT NULL,
	"messageCheckinInstructions" text NOT NULL,
	"messageGuildWelcome" text NOT NULL,
	"messageReminderWarning" text DEFAULT 'Hello! Are you still there?
**If we don''t get any reply from you, we are going to close this channel in $day day$grammarDay.**' NOT NULL,
	"reminderDayAmount" integer DEFAULT 3 NOT NULL,
	"dateFormat" varchar(10) DEFAULT 'YYYY-MM-DD' NOT NULL,
	"autoVerify" boolean DEFAULT false NOT NULL,
	"autoCheckIn" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guildTrusts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guildTrusts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildID" varchar(30) NOT NULL,
	"trustedGuildID" varchar(30) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guildTrusts_guildID_trustedGuildID_unique" UNIQUE("guildID","trustedGuildID")
);
--> statement-breakpoint
CREATE TABLE "verifiedUsers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "verifiedUsers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userID" varchar(30) NOT NULL,
	"guildID" varchar(30) NOT NULL,
	"teammemberID" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verifiedUsers_userID_guildID_unique" UNIQUE("userID","guildID")
);
--> statement-breakpoint
ALTER TABLE "guildSettingCheckinRoles" ADD CONSTRAINT "guildSettingCheckinRoles_guildSettingID_guildSettings_id_fk" FOREIGN KEY ("guildSettingID") REFERENCES "public"."guildSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guildSettingIgnoreChannels" ADD CONSTRAINT "guildSettingIgnoreChannels_guildSettingID_guildSettings_id_fk" FOREIGN KEY ("guildSettingID") REFERENCES "public"."guildSettings"("id") ON DELETE no action ON UPDATE no action;