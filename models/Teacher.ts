import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plainPassword: { type: String, required: false },
    templeName: { type: String, required: false },
    assignedClasses: { type: [String], default: [] },
    assignedSubjects: { type: [String], default: [] },
  },
  { timestamps: true }
);

if (mongoose.models.Teacher) {
  delete mongoose.models.Teacher;
}

export default mongoose.model("Teacher", TeacherSchema);
