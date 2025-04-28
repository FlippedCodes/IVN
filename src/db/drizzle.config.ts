import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migration',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DBhost,
    port: parseInt(<string>process.env.DBport, 10) || 5432,
    database: process.env.DBusername,
    user: process.env.DBusername,
    password: process.env.DBpassword,
  },
} satisfies Config;
