import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["all", "subadmin", "user"],
    default: "all",
  },
  // English Comment: Optional link to a specific temple if needed
  templeName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: String }], // English Comment: Array of user IDs who opened it
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
