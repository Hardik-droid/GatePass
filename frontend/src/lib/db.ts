import mongoose from "mongoose";

let cached = global as typeof globalThis & {
  _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached._mongoose) {
  cached._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached._mongoose!.conn) return cached._mongoose!.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  const DATABASE_NAME = process.env.DATABASE_NAME || "studentdata";

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI missing in .env.local");
  }

  if (!cached._mongoose!.promise) {
    cached._mongoose!.promise = mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  }

  cached._mongoose!.conn = await cached._mongoose!.promise;
  return cached._mongoose!.conn;
}
