import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const query: any = {};
        if (status) {
            query.status = status;
        }

        const temples = await Temple.find(query).sort({ name: 1 });
        return NextResponse.json({ success: true, data: temples });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        );
    }
}
