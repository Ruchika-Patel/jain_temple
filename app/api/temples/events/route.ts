import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    // 1. Database se connect karein
    await connectDB();

    // 2. Frontend se data nikaalein
    const { templeId, event } = await req.json();

    if (!templeId || !event.title || !event.date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 3. MongoDB ka $push operator use karein
    // Isse purane events delete nahi honge, naya event array mein jud jayega
    const updatedTemple = await Temple.findByIdAndUpdate(
      templeId,
      {
        $push: {
          events: {
            title: event.title,
            date: event.date,
            description: event.description,
            // MongoDB khud _id generate kar dega har event ke liye
          },
        },
      },
      { new: true }, // Taaki hume updated data mile
    );

    if (!updatedTemple) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event added successfully",
      data: updatedTemple.events,
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
