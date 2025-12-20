import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed", "freeship"],
      required: true,
    },

    value: {
      type: Number,
      required: function () {
        return this.type !== "freeship";
      },
    },
    maxDiscount: {type: Number,default: null, },
    minOrderValue: {type: Number,default: 0,},
    usageLimit: {type: Number,default: null, },
    usedCount: {type: Number,default: 0,},

    startDate: {type: Date,required: true,},
    endDate: {type: Date,required: true,},

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
