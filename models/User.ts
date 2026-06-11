import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    section: {
      type: String,
      default: "A",
    },
    password: {
      type: String,
      required: true,
    },
    plainPassword: {
      type: String,
      required: false,
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

// Delete cached model to force Mongoose to compile it with the updated schema under Next.js HMR
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model("User", UserSchema);
