import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { templeId, review } = await req.json();

    // 1. Check karo ki templeId aur review data hai ya nahi
    if (!templeId || !review) {
      return NextResponse.json(
        { success: false, message: "Temple ID and Review data are required" },
        { status: 400 },
      );
    }

    // 2. Temple dhundo aur usme review push karo
    const temple = await Temple.findById(templeId);
    if (!temple) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
        { status: 404 },
      );
    }

    // 3. Review array mein naya review add karein
    temple.reviews.push(review);

    // 4. (Optional but Good) Average Rating update karne ka logic
    const totalRatings = temple.reviews.reduce(
      (acc: number, curr: any) => acc + curr.rating,
      0,
    );
    temple.rating = totalRatings / temple.reviews.length;

    await temple.save();

    return NextResponse.json({
      success: true,
      message: "Review added successfully!",
      data: temple,
    });
  } catch (error: any) {
    console.error("Review Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
}
