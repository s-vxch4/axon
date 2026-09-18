import { neon } from '@neondatabase/serverless';

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(connectionString);
}

export const db = {
  async query(text, params) {
    const sql = getSql();
    return sql(text, params);
  },
};
