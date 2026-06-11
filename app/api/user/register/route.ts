import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // Aapka db connection helper
import User from "@/models/User"; // Aapka Mongoose Model
import bcrypt from "bcryptjs"; // Password hashing ke liye

export async function POST(req: Request) {
  try {
    await dbConnect(); // Connect to MongoDB Atlas/Localhost
    const body = await req.json();
    console.log("Incoming Registration Data:", body);
    const {
      name,
      email,
      password,
      studentClass,
      templeName,
      paymentId,
      amount,
      phone,
      address,
      city,
      state,
      pincode,
    } = body;

    // 0. Validation
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Phone number must be exactly 10 digits" },
        { status: 400 },
      );
    }

    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: "Pincode must be exactly 6 digits" },
        { status: 400 },
      );
    }

    // 1. Check if user exists (only if email is provided)
    if (email && email.trim() !== "") {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return NextResponse.json(
          { success: false, message: "Email already registered" },
          { status: 400 },
        );
      }
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Student ID: e.g., STU1001 + count
    const studentCount = await User.countDocuments({ role: "user" });
    const studentId = `STU${String(1001 + studentCount).padStart(4, "0")}`;

    // Generate Roll Number: e.g., Class abbreviation + sequence
    const classCount = await User.countDocuments({ role: "user", studentClass });
    const rollNumber = `${studentClass.replace(/\s+/g, "").slice(0, 5).toUpperCase()}-${String(101 + classCount)}`;

    // 3. Create User in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      plainPassword: password,
      studentClass,
      templeName: templeName || "General",
      paymentId,
      amount,
      phone,
      address,
      city,
      state,
      pincode,
      paid: true,
      role: "user",
      studentId,
      rollNumber,
      section: "A",
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("CRITICAL Registration Save Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
