import connectDB from "@/lib/mongodb";
import SubadminNotification from "@/models/SubadminNotification";
import { NextResponse } from "next/server";

// POST: Jab Subadmin naya notice bhejega
export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, message, templeName } = await req.json();

    if (!title || !message || !templeName) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing!" },
        { status: 400 },
      );
    }

    // English Comment: Create a new notification entry in the subadmin specific collection
    const newNotice = await SubadminNotification.create({
      title,
      message,
      templeName,
      targetType: "student", // Locked to students
    });

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully!",
      data: newNotice,
    });
  } catch (error: any) {
    console.error("Subadmin API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// GET: Jab Student apne temple ke notices load karega
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const temple = searchParams.get("temple");

    // English Comment: If temple is missing, return empty array instead of 400 error
    if (!temple || temple === "undefined") {
      return NextResponse.json({ success: true, data: [] });
    }

    // English Comment: Fetch notices for the specific temple
    const notices = await SubadminNotification.find({
      templeName: temple,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: notices });
  } catch (error: any) {
    // English Comment: Return JSON error to prevent "Unexpected token <"
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
