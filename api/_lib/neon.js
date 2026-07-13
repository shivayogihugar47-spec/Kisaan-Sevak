import path from "path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: path.resolve(process.cwd(), ".env") });

let sqlClient = null;

export function getSql() {
  if (sqlClient) return sqlClient;

  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing NEON_DATABASE_URL (or DATABASE_URL) server environment variable.");
  }

  sqlClient = neon(databaseUrl);
  return sqlClient;
}

export function readJsonBody(req) {
  if (!req?.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}
