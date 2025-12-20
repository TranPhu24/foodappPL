import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      ward: { type: String, required: true, trim: true },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "VNPAY"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "shipping", "completed", "cancelled", ],
      default: "pending",
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    confirmedAt: {type: Date,default: null,},
    preparingAt: {type: Date,default: null,},
    shippingAt: {type: Date,default: null,},
    completedAt: {type: Date,default: null,},

    cancelledBy: {
      type: String,
      enum: ["user", "employee", "admin"],
      default: null,
    },
    cancelReason: {type: String,default: "",},
    cancelledAt: {type: Date,default: null,},

    shippingFee: { type: Number, default: 0 },
    discount: {
      code: { type: String },
      type: { type: String },
      value: { type: Number },
      amount: { type: Number }, 
    },

    totalPrice: { type: Number, required: true },
    finalTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;

