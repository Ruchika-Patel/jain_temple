import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userRole = searchParams.get("type"); // admin, subadmin, or user
    const temple = searchParams.get("temple") || "All";

    // English Comment: Logic to filter notifications based on target role and temple
    const query: any = {
      $and: [
        // Role based filtering:
        // 1. "all" messages are for everyone
        // 2. Otherwise, match the specific role (user or subadmin)
        { type: { $in: ["all", userRole] } },

        // Temple based filtering:
        // Show global "All" notices OR notices specific to user's temple
        {
          $or: [{ templeName: "All" }, { templeName: temple }],
        },
      ],
    };

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
