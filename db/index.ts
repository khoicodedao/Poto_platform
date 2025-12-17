import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
  drizzle?: ReturnType<typeof drizzle<typeof schema>>;
};

const client =
  globalForDb.postgresClient ??
  postgres(connectionString, {
    prepare: false,
    max: 5,
  });

const dbInstance = globalForDb.drizzle ?? drizzle(client, { schema });

if (!globalForDb.postgresClient) {
  globalForDb.postgresClient = client;
}
if (!globalForDb.drizzle) {
  globalForDb.drizzle = dbInstance;
}

export const db = dbInstance;

export * from './schema';
