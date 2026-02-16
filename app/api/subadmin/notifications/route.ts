import connectDB from "@/lib/mongodb";
import SubadminNotification from "@/models/SubadminNotification";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, message, templeName } = await req.json();

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

    if (!temple) return NextResponse.json({ success: true, data: [] });

    const notices = await SubadminNotification.find({
      templeName: temple,
    }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: notices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
