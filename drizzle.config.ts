import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Ignora tabelas internas criadas pela extensão PostGIS
  tablesFilter: ['!spatial_ref_sys', '!geography_columns', '!geometry_columns'],
});
