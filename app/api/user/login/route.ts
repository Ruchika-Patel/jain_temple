import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found!" },
        { status: 404 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Wrong password!" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome back!",
      name: user.name,
      email: user.email,
      role: "user",
      templeName: user.templeName,
      studentClass: user.studentClass,
      paymentId: user.paymentId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
