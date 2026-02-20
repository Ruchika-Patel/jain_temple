import connectDB from "@/lib/mongodb";
import Temple from "@/models/Temple";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function PATCH(req: Request) {
  try {
    // 1. Database se connect karein
    await connectDB();

    // 2. Frontend se data nikaalein
    const body = await req.json();
    const { templeId, event } = body;

    console.log(`[API PATCH] Temple: ${templeId}, Event Title: ${event?.title}`);
    console.log(`[API PATCH] Incoming Image length: ${event?.image?.length || 0}`);

    if (!templeId || !event.title || !event.date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 3. Robust Save Pattern: Find -> Push -> Save
    const temple = await Temple.findById(templeId);

    if (!temple) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
        { status: 404 },
      );
    }

    // Ensure events array exists
    if (!temple.events) temple.events = [];

    // Add new event
    const newEvent = {
      title: event.title,
      date: event.date,
      description: event.description,
      image: event.image || "",
    };

    temple.events.push(newEvent);
    await temple.save();

    const savedEvent = temple.events[temple.events.length - 1];

    return NextResponse.json({
      success: true,
      message: "Event added successfully",
      debugInfo: {
        receivedImageLength: event.image?.length || 0,
        savedImageLength: savedEvent?.image?.length || 0
      },
      data: temple.events,
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { templeId, eventId, eventData } = body;

    console.log(`[API PUT] Temple: ${templeId}, Event: ${eventId}`);
    console.log(`[API PUT] Image Data length: ${eventData?.image?.length || 0}`);

    if (!templeId || !eventId || !eventData) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Direct update using positional operator for reliability
    const updatedTemple = await Temple.findOneAndUpdate(
      { _id: templeId, "events._id": eventId },
      {
        $set: {
          "events.$.title": eventData.title,
          "events.$.date": eventData.date,
          "events.$.description": eventData.description,
          "events.$.image": eventData.image || "",
        }
      },
      { new: true }
    );

    if (!updatedTemple) {
      return NextResponse.json(
        { success: false, message: "Temple or Event not found" },
        { status: 404 },
      );
    }

    const updatedEvent = updatedTemple.events.id(eventId);

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      debugInfo: {
        receivedImageLength: eventData.image?.length || 0,
        savedImageLength: updatedEvent?.image?.length || 0
      },
      data: updatedTemple.events,
    });
  } catch (error: any) {
    console.error("[API PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { templeId, eventId } = await req.json();

    if (!templeId || !eventId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const updatedTemple = await Temple.findByIdAndUpdate(
      templeId,
      {
        $pull: { events: { _id: eventId } },
      },
      { new: true },
    );

    if (!updatedTemple) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
      data: updatedTemple.events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
