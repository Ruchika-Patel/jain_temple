import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const body = await req.json();
        const { id } = await params;
        console.log("PUT request for temple ID:", id);

        // Remove _id from body to prevent Mongoose error
        const { _id, ...updateData } = body;

        const updatedTemple = await Temple.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedTemple) {
            return NextResponse.json(
                { success: false, message: "Temple not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Temple updated successfully",
            data: updatedTemple,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        console.log("DELETE request for temple ID:", id);

        // 1. Find the temple to be deleted to get its displayId
        const templeToDelete = await Temple.findById(id);

        if (!templeToDelete) {
            return NextResponse.json(
                { success: false, message: "Temple not found" },
                { status: 404 }
            );
        }

        const deletedDisplayIdStr = templeToDelete.displayId;

        // 2. Delete the temple
        await Temple.findByIdAndDelete(id);

        // 3. Re-index: Find all temples with displayId > deletedDisplayId
        //    (Only if displayId exists and is a valid number string)
        if (deletedDisplayIdStr && !isNaN(Number(deletedDisplayIdStr))) {
            const deletedIdNum = Number(deletedDisplayIdStr);
            console.log(`Re-indexing temples with displayId > ${deletedIdNum}`);

            const templesToUpdate = await Temple.find({
                displayId: { $gt: deletedDisplayIdStr } // Lexicographical check works for "03" > "02", but numeric is safer if we iterate
            });

            // Iterate and update each one
            // Note: A bulkWrite would be more efficient for many records, but loop is fine for smaller datasets
            for (const temple of templesToUpdate) {
                const currentIdNum = Number(temple.displayId);
                if (!isNaN(currentIdNum)) {
                    const newIdNum = currentIdNum - 1;
                    const newIdStr = String(newIdNum).padStart(2, "0");
                    console.log(`Updating temple ${temple.name}: ${temple.displayId} -> ${newIdStr}`);
                    temple.displayId = newIdStr;
                    await temple.save();
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Temple deleted and IDs re-indexed successfully",
        });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
