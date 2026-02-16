import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  // URL clean karne ke liye: quotes aur spaces hatata hai
  const cleanUri = MONGODB_URI?.replace(/^["']|["']$/g, "").trim();

  if (!cleanUri) {
    throw new Error("MONGODB_URI missing in .env file");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(cleanUri, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
export default connectDB;
