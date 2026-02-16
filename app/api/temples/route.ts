import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import { NextResponse } from "next/server";

// 1. Temple Save
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // New temple create
    const newTemple = await Temple.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Temple registered successfully!",
        data: newTemple,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// 2. Temples Fetch  (GET)
export async function GET() {
  try {
    await connectDB();
    const temples = await Temple.find({}); // Saare temples uthao
    return NextResponse.json({ success: true, data: temples });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
