import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Temple from "@/models/Temple";

export async function POST(req: Request) {
  try {
    //  Establish database connection
    await dbConnect();
    console.log("Database connected for POST /api/temples/committee");

    //  Parse the request body
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    const { templeName, committee } = body;

    //  Validation - Check if temple name is provided
    if (!templeName) {
      console.error("Error: Temple name missing");
      return NextResponse.json(
        { success: false, message: "Temple name is required" },
        { status: 400 },
      );
    }

    console.log(`Updating committee for temple: ${templeName}`);
    console.log(`Committee data to save:`, JSON.stringify(committee, null, 2));

    //  Find temple by name and update its committee field
    // $set will replace the existing array with the new one sent from SubAdmin dashboard
    const updatedTemple = await Temple.findOneAndUpdate(
      { name: templeName },
      { $set: { committee: committee } },
      { new: true, runValidators: true },
    );

    if (!updatedTemple) {
      console.error(`Error: Temple '${templeName}' not found`);
      return NextResponse.json(
        { success: false, message: "Temple not found in database" },
        { status: 404 },
      );
    }

    console.log("Update successful. New committee data:", JSON.stringify(updatedTemple.committee, null, 2));

    return NextResponse.json({
      success: true,
      message: "Committee updated successfully",
      data: updatedTemple.committee,
    });
  } catch (error: any) {
    console.error("Database Update Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const templeName = searchParams.get("templeName");

    if (!templeName) {
      return NextResponse.json(
        { success: false, message: "Temple name is required" },
        { status: 400 },
      );
    }

    const temple = await Temple.findOne({ name: templeName });

    if (!temple) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: temple.committee || [],
    });

  } catch (error: any) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
