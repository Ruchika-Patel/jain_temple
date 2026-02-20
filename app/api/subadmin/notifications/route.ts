import connectDB from "@/lib/mongodb";
import SubadminNotification from "@/models/SubadminNotification";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, message, templeName, targetClass } = await req.json();

    if (!title || !message || !templeName) {
      return NextResponse.json(
        { success: false, message: "Fields missing" },
        { status: 400 },
      );
    }

    const newNotice = await SubadminNotification.create({
      title,
      message,
      templeName,
      targetType: "student",
      targetClass: targetClass || "all",
    });

    return NextResponse.json({
      success: true,
      message: "Sent!",
      data: newNotice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const temple = searchParams.get("temple");
    const studentClass = searchParams.get("studentClass");

    if (!temple) return NextResponse.json({ success: true, data: [] });

    const query: any = { templeName: temple };

    // If studentClass is provided, filter:
    // Show notifications where targetClass is "all" OR targetClass matches the student's class
    if (studentClass) {
      query.$or = [
        { targetClass: "all" },
        { targetClass: null }, // Handle existing docs
        { targetClass: studentClass }
      ];
    }

    const notices = await SubadminNotification.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: notices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, title, message, targetClass } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
    }

    const updated = await SubadminNotification.findByIdAndUpdate(
      id,
      { title, message, targetClass },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
    }

    const deleted = await SubadminNotification.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
