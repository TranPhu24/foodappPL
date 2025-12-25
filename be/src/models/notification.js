import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["normal", "discount"],
      default: "normal",
      index: true,
    },

    title: {type: String,required: true,trim: true,},

    message: {type: String,required: true,trim: true,},

    discount: {
      code: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      quantity: { type: Number }, 
    },

    isRead: {type: Boolean,default: false,index: true},
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
