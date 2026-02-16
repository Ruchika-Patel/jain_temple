import connectDB from "@/lib/mongodb";
import SubAdmin from "@/models/SubAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const subadmin = await SubAdmin.findOne({ email });

    if (!subadmin) {
      return NextResponse.json(
        { success: false, message: "User not found!" },
        { status: 404 },
      );
    }

    const isMatch = await bcrypt.compare(password, subadmin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Wrong password!" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: subadmin.name,
        email: subadmin.email,
        role: subadmin.role,
        templeName: subadmin.templeName, // English Comment: Return the canonical temple name
      },
      templeName: subadmin.templeName, // Also return at top level for convenience
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
