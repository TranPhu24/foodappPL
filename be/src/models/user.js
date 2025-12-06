import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    hashedPassword: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      default: null
    },
    role: { 
      type: String, 
      enum: ["user", "employee", "admin"], 
      default: "user" 
    },

    resetOTP: { 
      type: Number, 
      default: null 
    },
    resetOTPExpires: { 
      type: Date, 
      default: null 
    },
        createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (this.isModified("hashedPassword")) {
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, 12);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.hashedPassword);
};

export default mongoose.model("User", userSchema);