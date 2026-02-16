import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import SubAdmin from "@/models/SubAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { templeId } = await req.json();

    const updatedTemple = await Temple.findByIdAndUpdate(
      templeId,
      { status: "verified" },
      { new: true },
    );

    if (!updatedTemple) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
        { status: 404 },
      );
    }

    // Automatically Create Sub-Admin Account
    // English Comment: Taking the first leader as the default subadmin
    const primaryLeader = updatedTemple.leaders?.[0];

    if (primaryLeader && primaryLeader.email) {
      const hashedPassword = await bcrypt.hash("aman123", 10);

      try {
        // English Comment: Create or update subadmin (email is unique)
        await SubAdmin.findOneAndUpdate(
          { email: primaryLeader.email },
          {
            name: primaryLeader.name,
            email: primaryLeader.email,
            password: hashedPassword,
            templeName: updatedTemple.name,
            role: "subadmin",
          },
          { upsert: true, new: true },
        );
      } catch (subAdminError: any) {
        console.error("SUBADMIN_CREATION_ERROR:", subAdminError.message);
        // Non-blocking for temple verification
      }
    }

    return NextResponse.json({ success: true, data: updatedTemple });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
