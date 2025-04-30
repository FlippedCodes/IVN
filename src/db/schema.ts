import { relations } from 'drizzle-orm';

import {
  pgTable,
  timestamp,
  varchar,
  integer,
  unique,
  boolean,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const maintainerTable = pgTable('maintainers', {
  id: varchar({ length: 30 }).primaryKey(),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const guildTable = pgTable('guilds', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  guildID: varchar({ length: 30 }).notNull(),
  enabled: boolean().notNull().default(false),

  dateFormat: varchar({ length: 10 }).notNull().default('YYYY-MM-DD'),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const permissionEnum = pgEnum('permission', ['unused', 'requested', 'yes', 'no']);

export const guildPermissionsTable = pgTable(
  'guildPermissions',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guildID: integer()
      .notNull()
      .references(() => guildTable.id),
    partneredGuildID: integer()
      .notNull()
      .references(() => guildTable.id),
    trustVerificationExchange: permissionEnum().notNull().default('unused'),
    trustCheckin: permissionEnum().notNull().default('unused'),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.guildID, t.partneredGuildID)]
);

export const verifiedUserTable = pgTable(
  'verifiedUsers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userID: varchar({ length: 30 }).notNull(),
    guildID: integer()
      .notNull()
      .references(() => guildTable.id),
    teammemberID: varchar({ length: 30 }).notNull(),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.userID, t.guildID)]
);

export const guildVerificationSettingTable = pgTable('guildVerificationSettings', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  guildID: integer()
    .notNull()
    .references(() => guildTable.id),
  enabled: boolean().notNull().default(false),

  verifierRoleID: varchar({ length: 30 }).notNull(),
  joinRoleID: varchar({ length: 30 }).notNull(),
  assignJoinRole: boolean().notNull().default(false),

  kickoffEmoji: varchar({ length: 1 }).notNull(),
  kickoffChannelID: varchar({ length: 30 }).notNull(),
  kickoffMessageID: varchar({ length: 30 }).notNull(),

  categoryID: varchar({ length: 30 }).notNull(),
  guildWelcomeChannelID: varchar({ length: 30 }).notNull(),
  archiveChannelID: varchar({ length: 30 }).notNull(),

  messageCheckinInstructions: text().notNull(),
  messageGuildWelcome: text().notNull(),
  verificationInstructionMessageID: varchar({ length: 30 }).notNull(),
  messageReminderWarning: text()
    .notNull()
    .default(
      `Hello $userMention! Are you still there?\n**If we don't get any reply from you, we are going to close this channel in $day day$grammarDay.**`
    ),

  reminderDayAmount: integer().notNull().default(3),

  autoVerify: boolean().notNull().default(false),
  autoCheckIn: boolean().notNull().default(false),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const guildVerificationSettingIgnoreChannelTable = pgTable(
  'guildVerificationSettingIgnoreChannels',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guildID: integer()
      .notNull()
      .references(() => guildVerificationSettingTable.id),
    ignoreChannelID: varchar({ length: 30 }).notNull(),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.guildID, t.ignoreChannelID)]
);

export const guildVerificationSettingCheckinRoleTable = pgTable(
  'guildVerificationSettingCheckinRoles',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guildID: integer()
      .notNull()
      .references(() => guildVerificationSettingTable.id),
    checkinRoleID: varchar({ length: 30 }).notNull(),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.guildID, t.checkinRoleID)]
);

export const guildRelations = relations(guildTable, ({ one, many }) => ({
  guildVerificationSetting: one(guildVerificationSettingTable, {
    fields: [guildTable.id],
    references: [guildVerificationSettingTable.guildID],
  }),
  verifiedUsers: many(verifiedUserTable),
  guildPermissions: many(guildPermissionsTable),
}));

export const guildVerificationSettingRelations = relations(
  guildVerificationSettingTable,
  ({ many }) => ({
    guildSettingIgnoreChannels: many(guildVerificationSettingIgnoreChannelTable),
    guildSettingCheckinRoles: many(guildVerificationSettingCheckinRoleTable),
  })
);
