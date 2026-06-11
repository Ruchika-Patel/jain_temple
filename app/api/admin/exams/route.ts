import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const exams = await Exam.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: exams });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { grade, subject, date, time, duration, examType, negativeMarking, negativeMarks, questions, venue } = body;

    if (!grade || !subject || !date || !time || !duration) {
      return NextResponse.json({ success: false, message: "Missing required fields!" }, { status: 400 });
    }

    const examCount = await Exam.countDocuments({});
    const examId = `EX${String(101 + examCount).padStart(3, "0")}`;

    const newExam = await Exam.create({
      examId,
      grade,
      subject,
      date,
      time,
      duration: Number(duration),
      examType: examType || "online",
      negativeMarking: !!negativeMarking,
      negativeMarks: Number(negativeMarks || 0),
      questions: questions || [],
      venue: venue || "Not Assigned",
    });

    return NextResponse.json({ success: true, message: "Exam created successfully!", data: newExam });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, grade, subject, date, time, duration, examType, negativeMarking, negativeMarks, questions, venue } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Exam DB ID is required!" }, { status: 400 });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      {
        grade,
        subject,
        date,
        time,
        duration: Number(duration),
        examType,
        negativeMarking: !!negativeMarking,
        negativeMarks: Number(negativeMarks || 0),
        questions: questions || [],
        venue,
      },
      { new: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ success: false, message: "Exam not found!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Exam updated successfully!", data: updatedExam });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Exam DB ID is required!" }, { status: 400 });
    }

    const deletedExam = await Exam.findByIdAndDelete(id);
    if (!deletedExam) {
      return NextResponse.json({ success: false, message: "Exam not found!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Exam deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
