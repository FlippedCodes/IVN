import { drizzle } from 'drizzle-orm/node-postgres';

import dbConfig from './drizzle.config';

import * as schema from './schema';

// Object.assign(dbConfig.dbCredentials, { multipleStatements: true });

export const db = drizzle(dbConfig.dbCredentials.url, { schema, casing: 'camelCase' });
