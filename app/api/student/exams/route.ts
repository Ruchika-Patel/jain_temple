import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Result from "@/models/Result";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET exams for a student's class (including results status if taken)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");
    const studentId = searchParams.get("studentId"); // Student MongoDB ID

    if (!grade) {
      return NextResponse.json({ success: false, message: "Class/Grade is required!" }, { status: 400 });
    }

    // Find exams scheduled for this class
    const exams = await Exam.find({ grade }).lean();

    // Check if the student has already taken these exams
    const examsWithStatus = await Promise.all(
      exams.map(async (exam: any) => {
        let hasTaken = false;
        let scoreDetails = null;

        if (studentId) {
          const result = await Result.findOne({ studentId, examId: exam._id });
          if (result) {
            hasTaken = true;
            scoreDetails = {
              marksObtained: result.marksObtained,
              totalMarks: result.totalMarks,
              percentage: result.percentage,
              grade: result.grade,
              status: result.status,
            };
          }
        }

        return {
          ...exam,
          hasTaken,
          scoreDetails,
        };
      })
    );

    return NextResponse.json({ success: true, data: examsWithStatus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST submit online exam responses and grade
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentId, examId, answers } = body; // answers: array of { questionId, selectedOptionIndex, writtenAnswerText }

    if (!studentId || !examId || !answers) {
      return NextResponse.json({ success: false, message: "Missing required fields!" }, { status: 400 });
    }

    // Verify if already taken
    const existingResult = await Result.findOne({ studentId, examId });
    if (existingResult) {
      return NextResponse.json({ success: false, message: "You have already submitted this exam!" }, { status: 400 });
    }

    // Fetch the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ success: false, message: "Exam not found!" }, { status: 404 });
    }

    let marksObtained = 0;
    let totalMarks = 0;
    const gradedAnswers: any[] = [];

    // Loop through exam questions to grade them
    exam.questions.forEach((q: any) => {
      const studentAns = answers.find((a: any) => String(a.questionId) === String(q._id));
      const marks = q.marks || 1;
      totalMarks += marks;

      let marksAwarded = 0;
      let selectedOptionIndex = -1;
      let writtenAnswerText = "";

      if (studentAns) {
        selectedOptionIndex = studentAns.selectedOptionIndex;
        writtenAnswerText = studentAns.writtenAnswerText || "";

        if (q.questionType === "objective") {
          if (studentAns.selectedOptionIndex === q.correctOptionIndex) {
            marksAwarded = marks;
            marksObtained += marks;
          } else if (studentAns.selectedOptionIndex !== -1 && exam.negativeMarking) {
            // Apply negative marking
            const penalty = exam.negativeMarks || 0;
            marksAwarded = -penalty;
            marksObtained -= penalty;
          }
        } else {
          // Subjective is graded 0 by default until manually reviewed
          marksAwarded = 0;
        }
      }

      gradedAnswers.push({
        questionId: q._id,
        selectedOptionIndex,
        writtenAnswerText,
        marksAwarded,
      });
    });

    // Ensure score is not negative
    if (marksObtained < 0) marksObtained = 0;

    const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;

    // Helper to calculate Grade
    const getGrade = (pct: number) => {
      if (pct >= 90) return "A+";
      if (pct >= 80) return "A";
      if (pct >= 70) return "B";
      if (pct >= 60) return "C";
      if (pct >= 50) return "D";
      if (pct >= 33) return "E";
      return "F";
    };

    const grade = getGrade(percentage);
    const status = percentage >= 33 ? "Passed" : "Failed";

    const result = await Result.create({
      studentId,
      examId,
      marksObtained: parseFloat(marksObtained.toFixed(2)),
      totalMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      grade,
      status,
      answers: gradedAnswers,
      checked: exam.questions.every((q: any) => q.questionType === "objective"), // If objective only, marks are fully checked
    });

    return NextResponse.json({
      success: true,
      message: "Exam submitted and graded successfully!",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
