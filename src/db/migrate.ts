import { migrate } from 'drizzle-orm/node-postgres/migrator';

import path from 'path';

import { db } from './connect';

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: path.join(__dirname, './migration') });

// Don't forget to close the connection, otherwise the script will hang
// await db.end();
