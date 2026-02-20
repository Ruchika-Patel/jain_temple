import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

const HARDCODED_CLASSES = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${n}${suffix} Class`;
});

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const templeName = searchParams.get("templeName");
        const forRegistration = searchParams.get("forRegistration");

        // Fetch existing class data from DB
        const dbClasses = await Class.find({}).lean();

        // Merge hardcoded classes with DB data
        const mergedClasses = HARDCODED_CLASSES.map((grade, index) => {
            const dbClass = dbClasses.find((c: any) => c.grade === grade);
            return dbClass || {
                grade,
                examVenue: "Not Assigned",
                examDate: "TBA",
                examTime: "TBA",
                instructions: "No specific instructions",
                status: "Active",
                isCompleted: false,
                students: 0
            };
        });

        if (forRegistration === "true") {
            // For registration, we typically just need the first available/next class
            // But if it's dynamic based on "isCompleted", we filter merged list
            const nextClass = mergedClasses.find(c => !c.isCompleted);
            return NextResponse.json({ success: true, data: nextClass ? [nextClass] : [] });
        }

        // English Comment: If templeName is provided, calculate student counts for this specific temple
        if (templeName) {
            const User = (await import("@/models/User")).default;

            const classesWithCounts = await Promise.all(mergedClasses.map(async (cls: any) => {
                const count = await User.countDocuments({
                    templeName: { $regex: new RegExp(`^${templeName.trim()}$`, "i") },
                    studentClass: cls.grade,
                    role: { $in: ["user", "student"] }
                });
                return { ...cls, studentCount: count };
            }));

            return NextResponse.json({ success: true, data: classesWithCounts });
        }

        return NextResponse.json({ success: true, data: mergedClasses });
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

        const { id, isCompleted, ...data } = body;

        // Ensure isCompleted is a boolean
        const formattedData = {
            ...data,
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
