import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Fields missing" }, { status: 400 });
    }

    // Check if exists
    const existing = await Admin.findOne({ username });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Admin already exists!" },
        { status: 400 },
      );
    }

    // Create Admin
    const newAdmin = await Admin.create({ username, password });
    return NextResponse.json({
      success: true,
      message: "Admin created successfully!",
      data: { username: newAdmin.username },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
