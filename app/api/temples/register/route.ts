import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Data validation (basic)
    if (!body.name || !body.state || !body.city) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (Name, State, City)",
        },
        { status: 400 },
      );
    }

    // Generate sequential ID (01, 02 style)
    const count = await Temple.countDocuments();
    const displayId = String(count + 1).padStart(2, "0");

    // Creating the record in MongoDB
    const newTemple = await Temple.create({
      ...body,
      displayId,
      status: "pending", // Hamesha default pending rakhenge
      rating: 0,
      reviews: [],
      events: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Temple registered successfully! Pending for admin approval.",
        data: newTemple,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
}
