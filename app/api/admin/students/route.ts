import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// GET all students
export async function GET(req: Request) {
  try {
    await connectDB();
    const students = await User.find({ role: "user" }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a student
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, studentClass, section, password, templeName, address, city, state, pincode } = body;

    if (!name || !studentClass || !password) {
      return NextResponse.json({ success: false, message: "Name, Class, and Password are required!" }, { status: 400 });
    }

    // Generate Student ID: e.g., STU1001 + count
    const studentCount = await User.countDocuments({ role: "user" });
    const studentId = `STU${String(1001 + studentCount).padStart(4, "0")}`;

    // Generate Roll Number: e.g., Class abbreviation + sequence
    const classCount = await User.countDocuments({ role: "user", studentClass });
    const rollNumber = `${studentClass.replace(/\s+/g, "").slice(0, 5).toUpperCase()}-${String(101 + classCount)}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await User.create({
      name,
      email: email || undefined,
      phone: phone || "",
      studentClass,
      section: section || "A",
      password: hashedPassword,
      plainPassword: password,
      studentId,
      rollNumber,
      templeName: templeName || "General",
      paid: true, // Admin-created is marked paid by default
      amount: 0,
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
    });

    return NextResponse.json({ success: true, message: "Student registered successfully!", data: newStudent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update student
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, email, phone, studentClass, section, templeName, rollNumber, address, city, state, pincode, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Student ID is required!" }, { status: 400 });
    }

    const existing = await User.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Student not found!" }, { status: 404 });
    }

    const updateData: any = {
      name,
      email: email || undefined,
      phone,
      studentClass,
      section,
      templeName,
      address,
      city,
      state,
      pincode,
    };

    // Auto-generate missing student ID or roll number for legacy accounts
    if (!existing.studentId) {
      const studentCount = await User.countDocuments({ role: "user" });
      updateData.studentId = `STU${String(1001 + studentCount).padStart(4, "0")}`;
    } else {
      updateData.studentId = existing.studentId;
    }

    if (!existing.rollNumber) {
      const classCount = await User.countDocuments({ role: "user", studentClass });
      updateData.rollNumber = `${studentClass.replace(/\s+/g, "").slice(0, 5).toUpperCase()}-${String(101 + classCount)}`;
    } else {
      updateData.rollNumber = rollNumber || existing.rollNumber;
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
      updateData.plainPassword = password;
    }

    const updatedStudent = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedStudent) {
      return NextResponse.json({ success: false, message: "Student not found!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Student details updated!", data: updatedStudent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE student
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Student ID is required!" }, { status: 400 });
    }

    const deletedStudent = await User.findByIdAndDelete(id);
    if (!deletedStudent) {
      return NextResponse.json({ success: false, message: "Student not found!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Student deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
