import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, default: "" },
  link: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Banner ||
  mongoose.model("Banner", BannerSchema);
