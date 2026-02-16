
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Temple from "@/models/Temple";

export async function GET() {
    await dbConnect();
    const temples = await Temple.find({});
    return NextResponse.json(temples.map(t => ({
        name: t.name,
        id: t._id,
        committeeCount: t.committee?.length || 0,
        committeeType: Array.isArray(t.committee) ? 'Array' : typeof t.committee
    })));
}
