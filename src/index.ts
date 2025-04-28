import { SapphireClient, ApplicationCommandRegistries } from '@sapphire/framework';

import { GatewayIntentBits } from 'discord.js';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from './db/connect';

import * as packageInfo from '../package.json';

import * as config from '../config.json';

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  logger: {
    level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info,
  },
});

// TODO: Register all commands at Discord first. So we get all idHints
// if (process.env.NODE_ENV === 'development')
//   ApplicationCommandRegistries.setDefaultGuildIds([String(process.env.devGuild)]);

// db setup and connect
await migrate(db, { migrationsFolder: './src/db/migration' });
container.logger.info('🛢️ Synced database successfully!');

client.login(process.env.DCtoken);
console.debug('🔓 Login successful.');

client.on('ready', async () => {
  console.log(`[${packageInfo.name}] Logged in as "${client.user.tag}"!`);
});
