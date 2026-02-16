import mongoose from "mongoose";

//  Sub-schema for reviews
const ReviewSchema = new mongoose.Schema({
  user: String,
  rating: Number,
  comment: String,
  date: String,
});

//  Sub-schema for temple events
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: String,
  description: String,
});

// Reusable schema for both Leaders and Committee Members
const LeaderSchema = new mongoose.Schema({
  name: String,
  designation: String,
  phone: String,
  email: String,
});

const committeeSchema = new mongoose.Schema({
  name: String,
  designation: String,
  phone: String,
  email: String,
});

const TempleSchema = new mongoose.Schema(
  {
    displayId: { type: String, unique: true }, // "01", "02" style ID
    name: { type: String, required: true },
    country: { type: String, default: "India" },
    state: { type: String, required: true },
    city: { type: String, required: true },
    locality: String,
    pincode: String,
    images: [String], // Array for multiple images
    status: { type: String, enum: ["verified", "pending"], default: "pending" },
    description: String,
    history: String,
    rating: { type: Number, default: 0 },

    //  Default leaders (often set by Super Admin)
    leaders: [LeaderSchema],

    // --- UPDATED: NEW FIELD FOR SUB-ADMIN MANAGEMENT ---
    committee: [committeeSchema],

    events: [EventSchema],
    reviews: [ReviewSchema],
  },
  { timestamps: true }, // Automatically manages createdAt and updatedAt
);

// Exporting the model with a check to prevent re-compilation in development
export default mongoose.models.Temple || mongoose.model("Temple", TempleSchema);
