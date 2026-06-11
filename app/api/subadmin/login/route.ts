import connectDB from "@/lib/mongodb";
import SubAdmin from "@/models/SubAdmin";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    let userRecord = await SubAdmin.findOne({ email });
    let isTeacher = false;

    if (!userRecord) {
      // Fallback: search Teacher collection by email only
      userRecord = await Teacher.findOne({ email });
      if (userRecord) {
        isTeacher = true;
      }
    }

    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: "User not found!" },
        { status: 404 },
      );
    }

    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Wrong password!" },
        { status: 401 },
      );
    }

    const role = isTeacher ? "teacher" : (userRecord.role || "subadmin");
    const canonicalTemple = userRecord.templeName || "General";

    return NextResponse.json({
      success: true,
      user: {
        name: userRecord.name,
        email: userRecord.email || "",
        phone: userRecord.phone || "",
        role: role,
        templeName: canonicalTemple,
        assignedClasses: isTeacher ? (userRecord.assignedClasses || []) : [],
        assignedSubjects: isTeacher ? (userRecord.assignedSubjects || []) : [],
      },
      templeName: canonicalTemple,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
