import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    // Database mein dhoondo
    const admin = await Admin.findOne({ username, password });

    if (admin) {
      console.log("✅ Login Successful for:", username);
      return NextResponse.json({ success: true, message: "Login Successful" });
    } else {
      console.log("❌ Authentication failed for:", username);
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 },
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
