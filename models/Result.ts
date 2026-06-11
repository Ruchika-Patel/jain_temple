import mongoose from "mongoose";

const StudentAnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true }, // refers to question schema _id
  selectedOptionIndex: { type: Number, default: -1 }, // for objective MCQ
  writtenAnswerText: { type: String, default: "" }, // for subjective
  marksAwarded: { type: Number, default: 0 },
});

const ResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    marksObtained: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "F" },
    status: { type: String, enum: ["Passed", "Failed"], default: "Failed" },
    answers: { type: [StudentAnswerSchema], default: [] },
    checked: { type: Boolean, default: false }, // Has subjective grading been finished?
  },
  { timestamps: true }
);

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);
