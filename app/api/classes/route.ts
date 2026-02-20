import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const templeName = searchParams.get("templeName");
        const forRegistration = searchParams.get("forRegistration");

        if (forRegistration === "true") {
            const nextClass = await Class.find({ isCompleted: { $ne: true } })
                .sort({ sequenceOrder: 1 })
                .limit(1)
                .lean();
            return NextResponse.json({ success: true, data: nextClass });
        }

        const classes = await Class.find({}).sort({ sequenceOrder: 1 }).lean();

        // English Comment: If templeName is provided, calculate student counts for this specific temple
        if (templeName) {
            const User = (await import("@/models/User")).default;

            const classesWithCounts = await Promise.all(classes.map(async (cls: any) => {
                const count = await User.countDocuments({
                    templeName: { $regex: new RegExp(`^${templeName.trim()}$`, "i") },
                    studentClass: cls.grade,
                    role: { $in: ["user", "student"] }
                });
                return { ...cls, studentCount: count };
            }));

            return NextResponse.json({ success: true, data: classesWithCounts });
        }

        return NextResponse.json({ success: true, data: classes });
    } catch (error: any) {
        console.error("[API Classes GET] Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const { id, sequenceOrder, isCompleted, ...data } = body;

        // Ensure sequenceOrder is a number
        const formattedData = {
            ...data,
            sequenceOrder: sequenceOrder ? Number(sequenceOrder) : 0,
            isCompleted: isCompleted === true || isCompleted === "true",
        };

        let classData;
        if (id && typeof id === "string" && id.length > 15) {
            // It's likely a MongoDB ID
            classData = await Class.findByIdAndUpdate(id, formattedData, {
                new: true,
                upsert: true,
            });
        } else {
            // Try to find by grade or create new
            classData = await Class.findOneAndUpdate({ grade: formattedData.grade }, formattedData, {
                new: true,
                upsert: true,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Class data saved successfully",
            data: classData,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        );
    }
}
