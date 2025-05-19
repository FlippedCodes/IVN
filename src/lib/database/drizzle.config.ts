import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/database/schema.ts',
  out: './src/lib/database/migration',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.DBusername}:${process.env.DBpassword}@${process.env.DBhost}:${parseInt(<string>process.env.DBport, 10) || 5432}/${process.env.DBusername}`,
  },
} satisfies Config;
