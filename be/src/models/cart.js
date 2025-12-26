import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {type: Number, required: true,},
  },
  { _id: false }
);


const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
      
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    discount: {
  code: { type: String },
  amount: { type: Number, default: 0 },
},


  totalQuantity: {type: Number,default: 0,},
  totalPrice: {type: Number,default: 0,},
  finalTotal: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

cartSchema.methods.calculateTotals = function () {
  this.totalQuantity = this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const discountAmount =this.discount && this.discount.amount ? this.discount.amount : 0;

  this.finalTotal = Math.max(this.totalPrice - discountAmount, 0);
};

export default mongoose.model("Cart", cartSchema);