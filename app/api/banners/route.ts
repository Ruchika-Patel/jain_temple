import connectDB from "@/lib/mongodb";
import Banner from "@/models/Banner";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const query = activeOnly ? { isActive: true } : {};
    const banners = await Banner.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: banners });
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
    const { imageUrl, title, link, isActive } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL/Base64 is required" },
        { status: 400 },
      );
    }

    const newBanner = await Banner.create({
      imageUrl,
      title: title || "",
      link: link || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({ success: true, data: newBanner });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, isActive, title, link } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 },
      );
    }

    const updateFields: any = {};
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (title !== undefined) updateFields.title = title;
    if (link !== undefined) updateFields.link = link;

    const updated = await Banner.findByIdAndUpdate(
      id,
      updateFields,
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 },
      );
    }

    const deleted = await Banner.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Banner deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
