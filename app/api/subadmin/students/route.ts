import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const templeName = searchParams.get("templeName");
        const studentClass = searchParams.get("studentClass");

        if (!templeName || !studentClass) {
            return NextResponse.json(
                { success: false, message: "Missing templeName or studentClass" },
                { status: 400 }
            );
        }

        // English Comment: Fetch users who match the temple and the specific class/grade
        const students = await User.find({
            templeName: { $regex: new RegExp(`^${templeName.trim()}$`, "i") },
            studentClass: { $regex: new RegExp(`^${studentClass.trim()}$`, "i") },
            role: { $in: ["user", "student"] }
        })
            .select("name email paid paymentId createdAt studentClass templeName phone address city state pincode")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error: any) {
        console.error("[API Students] Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
