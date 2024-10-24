import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "../../../migrations/schema";
// import { migrate } from "drizzle-orm/postgres-js/migrator";

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  console.log("🔴 no database URL");
}

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const drizzleDb = drizzle(client, { schema });

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

const globalForDrizzle = globalThis as unknown as {
  drizzle: PostgresJsDatabase<typeof schema> | undefined;
};

// In development, use the same drizzle instance globally to prevent creating multiple connections
const db = globalForDrizzle.drizzle ?? drizzleDb;

if (process.env.NODE_ENV !== "production") globalForDrizzle.drizzle = drizzleDb;

export default db;
