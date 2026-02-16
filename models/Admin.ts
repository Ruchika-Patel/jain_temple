import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// "admins" collection name forcefully use kar rahe hain
export default mongoose.models.Admin ||
  mongoose.model("Admin", AdminSchema, "admins");
