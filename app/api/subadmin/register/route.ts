import connectDB from "@/lib/mongodb";
import SubAdmin from "@/models/SubAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, templeName } = await req.json();

    if (!name || !email || !password || !templeName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSubAdmin = await SubAdmin.create({
      name,
      email,
      password: hashedPassword,
      templeName,
    });

    return NextResponse.json(
      { success: true, message: "New Sub-Admin Registered!" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("REGISTRATION_ERROR:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
