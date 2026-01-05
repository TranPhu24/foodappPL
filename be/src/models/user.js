import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    cityCode: { type: Number, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    wardCode: { type: Number, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);


const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    hashedPassword: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    },
    default: null,
  },

    googleId: { type: String, default: null },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: String,

    phone: { type: String, default: null},
    addresses: {
      type: [addressSchema],
      default: [],
    },
    favoriteFoods: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },

    role: { 
      type: String, 
      enum: ["user", "employee", "admin"], 
      default: "user" 
    },

    resetOTP: { type: Number, default: null },
    resetOTPExpires: { type: Date, default: null },
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