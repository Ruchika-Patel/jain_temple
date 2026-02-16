import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, message, type, templeName } = await req.json();

    const newNotification = await Notification.create({
      title,
      message,
      type,
      templeName,
    });

    return NextResponse.json({ success: true, data: newNotification });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
