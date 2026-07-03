import "server-only";

import mongoose from "mongoose";
import { isSupabaseConfigured } from "./supabase";

declare global {
  // eslint-disable-next-line no-var
  var __gatepassMongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __gatepassMongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

export async function connectToDatabase() {
  if (isSupabaseConfigured()) {
    return null;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required when Supabase is not configured");
  }

  const dbName = process.env.MONGODB_DB_NAME || "gatepass-gps";
  if (globalForMongoose.__gatepassMongoose?.conn) {
    return globalForMongoose.__gatepassMongoose.conn;
  }

  globalForMongoose.__gatepassMongoose ??= { conn: null, promise: null };
  if (!globalForMongoose.__gatepassMongoose.promise) {
    globalForMongoose.__gatepassMongoose.promise = mongoose.connect(uri, {
      dbName,
      bufferCommands: false,
    });
  }

  globalForMongoose.__gatepassMongoose.conn = await globalForMongoose.__gatepassMongoose.promise;
  return globalForMongoose.__gatepassMongoose.conn;
}
