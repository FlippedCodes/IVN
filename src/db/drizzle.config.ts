import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migration',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.DBhost}:${parseInt(<string>process.env.DBport, 10) || 3306}/${process.env.DBusername}`,
    user: process.env.DBusername,
    password: process.env.DBpassword,
  },
} satisfies Config;
