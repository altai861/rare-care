import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

declare global {
  var rareCareDb: Database.Database | undefined;
}

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "rare-care.sqlite");

export function getDatabase() {
  if (!globalThis.rareCareDb) {
    mkdirSync(dataDirectory, { recursive: true });
    globalThis.rareCareDb = new Database(databasePath);
    globalThis.rareCareDb.pragma("journal_mode = WAL");
  }

  return globalThis.rareCareDb;
}
