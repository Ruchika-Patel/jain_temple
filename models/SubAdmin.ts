import mongoose from "mongoose";

const SubAdminSchema = new mongoose.Schema(
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

    templeName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "subadmin",
    },
  },
  {
    timestamps: true,
    // Keeping strict: false as a fallback for flexibility
    strict: false,
  },
);

//  Deleting the model from cache to ensure the new schema is applied immediately during development
if (mongoose.models.SubAdmin) {
  delete mongoose.models.SubAdmin;
}

const SubAdmin =
  mongoose.models.SubAdmin || mongoose.model("SubAdmin", SubAdminSchema);

export default SubAdmin;
