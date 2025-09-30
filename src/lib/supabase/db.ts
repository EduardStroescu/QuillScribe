import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "../../../migrations/schema";
// import { migrate } from "drizzle-orm/postgres-js/migrator";

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("🔴 DATABASE_URL not set");
}

// Store globals to prevent creating multiple clients in dev
const globalForDrizzle = globalThis as unknown as {
  drizzle?: PostgresJsDatabase<typeof schema>;
  pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDrizzle.pgClient ||
  postgres(process.env.DATABASE_URL!, { prepare: false });
const db = globalForDrizzle.drizzle || drizzle(client, { schema });

// const migrateDb = async () => {
//   try {
//     console.log("🟠 Migrating client");
//     await migrate(db, { migrationsFolder: "migrations" });
//     console.log("🟢 Successfully Migrated");
//   } catch (error) {
//     console.log("🔴 Error Migrating client", error);
//   }
// };
// migrateDb();

if (process.env.NODE_ENV !== "production") {
  globalForDrizzle.pgClient = client;
  globalForDrizzle.drizzle = db;
}

export default db;
