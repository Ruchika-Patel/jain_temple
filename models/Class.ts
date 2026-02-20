import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
    {
        grade: { type: String, required: true, unique: true },
        examVenue: { type: String, default: "Not Assigned" },
        examDate: { type: String, default: "TBA" },
        examTime: { type: String, default: "TBA" },
        instructions: { type: String, default: "No specific instructions" },
        status: { type: String, default: "Active" },
        students: { type: Number, default: 0 },
        syllabus: { type: String }, // Base64 data or URL
        fileName: { type: String },
        isCompleted: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);
