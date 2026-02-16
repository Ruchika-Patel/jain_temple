import mongoose from "mongoose";

const SubadminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  templeName: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    default: "student",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SubadminNotification ||
  mongoose.model("SubadminNotification", SubadminNotificationSchema);
