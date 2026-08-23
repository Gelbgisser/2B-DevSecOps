import pg from "pg";

export async function pingDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return { status: "skipped" };
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 2000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return { status: "ok" };
  } catch (err) {
    return { status: "error", error: err.message };
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}
