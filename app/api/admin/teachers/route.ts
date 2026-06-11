import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const teachers = await Teacher.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: teachers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, password, assignedClasses, assignedSubjects, templeName } = body;

    if (!name || !phone || !email || !password) {
      return NextResponse.json({ success: false, message: "Name, Phone, Email and Password are required!" }, { status: 400 });
    }

    const existingTeacher = await Teacher.findOne({ phone });
    if (existingTeacher) {
      return NextResponse.json({ success: false, message: "Teacher with this phone number already exists!" }, { status: 400 });
    }

    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Teacher with this email already exists!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = await Teacher.create({
      name,
      email: email || "",
      phone,
      password: hashedPassword,
      plainPassword: password,
      templeName: templeName || "General",
      assignedClasses: assignedClasses || [],
      assignedSubjects: assignedSubjects || [],
    });

    return NextResponse.json({ success: true, message: "Teacher registered successfully!", data: newTeacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, email, phone, password, assignedClasses, assignedSubjects, templeName } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Teacher ID is required!" }, { status: 400 });
    }

    const updateData: any = {
      name,
      email: email || "",
      phone,
      templeName: templeName || "General",
      assignedClasses: assignedClasses || [],
      assignedSubjects: assignedSubjects || [],
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
      updateData.plainPassword = password;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedTeacher) {
      return NextResponse.json({ success: false, message: "Teacher not found!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Teacher details updated!", data: updatedTeacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Teacher ID is required!" }, { status: 400 });
    }

    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    if (!deletedTeacher) {
      return NextResponse.json({ success: false, message: "Teacher not found!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Teacher deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
