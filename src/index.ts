import {
  SapphireClient,
  ApplicationCommandRegistries,
  LogLevel,
  container,
} from '@sapphire/framework';

import { GatewayIntentBits, Partials } from 'discord.js';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from './lib/database/connect';

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction],
  logger: {
    level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info,
  },
});

// TODO: Register all commands at Discord first. So we get all idHints
if (process.env.NODE_ENV === 'development')
  ApplicationCommandRegistries.setDefaultGuildIds([String(process.env.devGuild)]);

// db setup and connect
await migrate(db, { migrationsFolder: './src/lib/database/migration' });
container.logger.info('🛢️ Synced database successfully!');

client.login(process.env.DCtoken);
