import connectDB from "@/lib/mongodb";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Helper function to calculate Grade based on percentage
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 33) return "E";
  return "F";
}

// GET results for an exam to display merit lists/reports
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json({ success: false, message: "Exam ID is required!" }, { status: 400 });
    }

    const results = await Result.find({ examId })
      .populate("studentId", "name studentId rollNumber studentClass section templeName")
      .populate("examId", "examId subject grade examType")
      .lean();

    // Sort by marksObtained descending to act as merit list
    const sortedResults = results.sort((a: any, b: any) => b.marksObtained - a.marksObtained);

    return NextResponse.json({ success: true, data: sortedResults });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add manual/offline result for a student
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentId, examId, marksObtained, totalMarks } = body;

    if (!studentId || !examId || marksObtained === undefined || !totalMarks) {
      return NextResponse.json({ success: false, message: "Missing required fields!" }, { status: 400 });
    }

    const pct = (Number(marksObtained) / Number(totalMarks)) * 100;
    const grade = calculateGrade(pct);
    const status = pct >= 33 ? "Passed" : "Failed";

    // Check if result already exists for this student + exam
    const existingResult = await Result.findOne({ studentId, examId });

    let result;
    if (existingResult) {
      existingResult.marksObtained = Number(marksObtained);
      existingResult.totalMarks = Number(totalMarks);
      existingResult.percentage = parseFloat(pct.toFixed(2));
      existingResult.grade = grade;
      existingResult.status = status;
      existingResult.checked = true;
      result = await existingResult.save();
    } else {
      result = await Result.create({
        studentId,
        examId,
        marksObtained: Number(marksObtained),
        totalMarks: Number(totalMarks),
        percentage: parseFloat(pct.toFixed(2)),
        grade,
        status,
        checked: true,
      });
    }

    return NextResponse.json({ success: true, message: "Marks uploaded successfully!", data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
