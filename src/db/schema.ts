import { relations } from 'drizzle-orm';

import { pgTable, timestamp, varchar, integer, unique, boolean, text } from 'drizzle-orm/pg-core';

export const verifiedUserTable = pgTable(
  'verifiedUsers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userID: varchar({ length: 30 }).notNull(),
    guildID: varchar({ length: 30 }).notNull(),
    teammemberID: varchar({ length: 30 }).notNull(),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.userID, t.guildID)]
);

export const guildTrustTable = pgTable(
  'guildTrusts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guildID: varchar({ length: 30 }).notNull(),
    trustedGuildID: varchar({ length: 30 }).notNull(),
    enabled: boolean().notNull().default(true),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.guildID, t.trustedGuildID)]
);

export const maintainerTable = pgTable('maintainers', {
  id: varchar({ length: 30 }).primaryKey(),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const guildSettingTable = pgTable('guildSettings', {
  id: varchar({ length: 30 }).primaryKey(),
  guildID: varchar({ length: 30 }).notNull(),

  verifierRoleID: varchar({ length: 30 }).notNull(),
  hideOpenChannelsRoleID: varchar({ length: 30 }).notNull(),

  kickoffEmoji: varchar({ length: 1 }).notNull(),
  kickoffChannelID: varchar({ length: 30 }).notNull(),
  kickoffMessageID: varchar({ length: 30 }).notNull(),

  categoryID: varchar({ length: 30 }).notNull(),
  guildWelcomeChannelID: varchar({ length: 30 }).notNull(),
  archiveChannelID: varchar({ length: 30 }).notNull(),

  messageCheckinInstructions: text().notNull(),
  messageGuildWelcome: text().notNull(),
  messageReminderWarning: text()
    .notNull()
    .default(
      `Hello! Are you still there?\n**If we don't get any reply from you, we are going to close this channel in $day day$grammarDay.**`
    ),

  reminderDayAmount: integer().notNull().default(3),

  dateFormat: varchar({ length: 10 }).notNull().default('YYYY-MM-DD'),

  autoVerify: boolean().notNull().default(false),
  autoCheckIn: boolean().notNull().default(false),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
// , (t) => [
//   check('dependency_autoVerify1', sql`${t.autoVerify} == true`),
// ]);

export const guildSettingIgnoreChannelTable = pgTable(
  'guildSettingIgnoreChannels',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guildSettingID: varchar({ length: 30 })
      .notNull()
      .references(() => guildSettingTable.id),
    ignoreChannelID: varchar({ length: 30 }).notNull(),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.guildSettingID, t.ignoreChannelID)]
);

export const guildSettingCheckinRoleTable = pgTable(
  'guildSettingCheckinRoles',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guildSettingID: varchar({ length: 30 })
      .notNull()
      .references(() => guildSettingTable.id),
    checkinRoleID: varchar({ length: 30 }).notNull(),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [unique().on(t.guildSettingID, t.checkinRoleID)]
);

export const guildSettingRelations = relations(guildSettingTable, ({ many }) => ({
  guildSettingIgnoreChannelTables: many(guildSettingIgnoreChannelTable),
  guildSettingCheckinRoles: many(guildSettingCheckinRoleTable),
}));
