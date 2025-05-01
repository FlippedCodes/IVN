CREATE TYPE "public"."permission" AS ENUM('unused', 'requested', 'yes', 'no');--> statement-breakpoint
CREATE TABLE "guildPermissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guildPermissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildID" integer NOT NULL,
	"partneredGuildID" integer NOT NULL,
	"trustVerificationExchange" "permission" DEFAULT 'unused' NOT NULL,
	"trustCheckin" "permission" DEFAULT 'unused' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guildPermissions_guildID_partneredGuildID_unique" UNIQUE("guildID","partneredGuildID")
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guilds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildID" varchar(30) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"dateFormat" varchar(10) DEFAULT 'YYYY-MM-DD' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guildVerificationSettingCheckinRoles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guildVerificationSettingCheckinRoles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildID" integer NOT NULL,
	"checkinRoleID" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guildVerificationSettingCheckinRoles_guildID_checkinRoleID_unique" UNIQUE("guildID","checkinRoleID")
);
--> statement-breakpoint
CREATE TABLE "guildVerificationSettingIgnoreChannels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guildVerificationSettingIgnoreChannels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildID" integer NOT NULL,
	"ignoreChannelID" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guildVerificationSettingIgnoreChannels_guildID_ignoreChannelID_unique" UNIQUE("guildID","ignoreChannelID")
);
--> statement-breakpoint
CREATE TABLE "guildVerificationSettings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guildVerificationSettings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guildID" integer NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"verifierRoleID" varchar(30),
	"joinRoleID" varchar(30),
	"kickoffEmoji" varchar(1),
	"kickoffChannelID" varchar(30),
	"kickoffMessageID" varchar(30),
	"ticketsCategoryID" varchar(30),
	"welcomeChannelID" varchar(30),
	"welcomeMessage" text,
	"transcriptChannelID" varchar(30),
	"checkinMessageInstructions" text,
	"verificationInstructionMessageID" varchar(30),
	"messageReminderWarning" text DEFAULT 'Hello $userMention! Are you still there?
**If we don''t get any reply from you, we are going to close this channel in $day day$grammarDay.**' NOT NULL,
	"reminderDayAmount" integer DEFAULT 3 NOT NULL,
	"autoVerify" boolean DEFAULT false NOT NULL,
	"autoCheckIn" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintainers" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifiedUsers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "verifiedUsers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userID" varchar(30) NOT NULL,
	"guildID" integer NOT NULL,
	"teammemberID" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verifiedUsers_userID_guildID_unique" UNIQUE("userID","guildID")
);
--> statement-breakpoint
ALTER TABLE "guildPermissions" ADD CONSTRAINT "guildPermissions_guildID_guilds_id_fk" FOREIGN KEY ("guildID") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guildPermissions" ADD CONSTRAINT "guildPermissions_partneredGuildID_guilds_id_fk" FOREIGN KEY ("partneredGuildID") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guildVerificationSettingCheckinRoles" ADD CONSTRAINT "guildVerificationSettingCheckinRoles_guildID_guildVerificationSettings_id_fk" FOREIGN KEY ("guildID") REFERENCES "public"."guildVerificationSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guildVerificationSettingIgnoreChannels" ADD CONSTRAINT "guildVerificationSettingIgnoreChannels_guildID_guildVerificationSettings_id_fk" FOREIGN KEY ("guildID") REFERENCES "public"."guildVerificationSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guildVerificationSettings" ADD CONSTRAINT "guildVerificationSettings_guildID_guilds_id_fk" FOREIGN KEY ("guildID") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifiedUsers" ADD CONSTRAINT "verifiedUsers_guildID_guilds_id_fk" FOREIGN KEY ("guildID") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;