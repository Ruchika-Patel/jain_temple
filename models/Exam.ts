import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ["objective", "subjective"], required: true },
  options: { type: [String], default: [] }, // Only for objective
  correctOptionIndex: { type: Number, default: 0 }, // Only for objective (0-based)
  correctAnswerText: { type: String, default: "" }, // Only for subjective reference
  marks: { type: Number, default: 1 },
});

const ExamSchema = new mongoose.Schema(
  {
    examId: { type: String, required: true, unique: true }, // e.g. EX101
    grade: { type: String, required: true }, // e.g. "1st Class"
    subject: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "HH:MM"
    duration: { type: Number, required: true }, // in minutes
    examType: { type: String, enum: ["online", "offline"], default: "online" },
    negativeMarking: { type: Boolean, default: false },
    negativeMarks: { type: Number, default: 0 },
    questions: { type: [QuestionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
