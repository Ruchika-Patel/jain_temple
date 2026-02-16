import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const classes = await Class.find({}).sort({ grade: 1 });
        return NextResponse.json({ success: true, data: classes });
    } catch (error: any) {
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

        const { id, ...data } = body;

        let classData;
        if (id && typeof id === "string" && id.length > 15) {
            // It's likely a MongoDB ID
            classData = await Class.findByIdAndUpdate(id, data, {
                new: true,
                upsert: true,
            });
        } else {
            // Try to find by grade or create new
            classData = await Class.findOneAndUpdate({ grade: data.grade }, data, {
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
