import { SapphireClient, ApplicationCommandRegistries } from '@sapphire/framework';

import { GatewayIntentBits } from 'discord.js';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from './db/connect';

import * as packageInfo from '../package.json';

import * as config from '../config.json';

if (process.env.NODE_ENV === 'development')
  ApplicationCommandRegistries.setDefaultGuildIds([String(process.env.devGuild)]);

// db setup and connect
await migrate(db, { migrationsFolder: './src/db/migration' });
console.debug('🛢️ Synced database successfully!');

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.DCtoken);
console.debug('🔓 Login successful.');

client.on('ready', async () => {
  console.log(`[${packageInfo.name}] Logged in as "${client.user.tag}"!`);
});
