import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    // English Comment: The class/grade selected by the student during registration
    studentClass: {
      type: String,
      required: true,
    },
    // English Comment: The name of the temple from which the student is registering (captured from URL)
    templeName: {
      type: String,
      required: false,
    },
    // English Comment: Payment tracking fields for Razorpay integration
    paid: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      default: 0,
    },
    savedTemples: [{ type: mongoose.Schema.Types.ObjectId, ref: "Temple" }],
  },
  { timestamps: true },
);

// English Comment: Checking if the model exists before creating a new one to prevent errors in Next.js HMR
export default mongoose.models.User || mongoose.model("User", UserSchema);
