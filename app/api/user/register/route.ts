import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // Aapka db connection helper
import User from "@/models/User"; // Aapka Mongoose Model
import bcrypt from "bcryptjs"; // Password hashing ke liye

export async function POST(req: Request) {
  try {
    await dbConnect(); // Connect to MongoDB Atlas/Localhost
    const body = await req.json();
    const {
      name,
      email,
      password,
      studentClass,
      templeName,
      paymentId,
      amount,
    } = body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 },
      );
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      studentClass,
      templeName,
      paymentId,
      amount,
      paid: true,
      role: "student",
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
