import Discount from "../models/discount.js";
import Cart from "../models/cart.js";
import catchAsync from "../utils/catchAsync.js";

export const createDiscount = catchAsync(async (req, res) => {
  const {
    code,
    type,
    value,
    maxDiscount,
    minOrderValue = 0,
    usageLimit,
    startDate,
    endDate,
  } = req.body;

  const existingDiscount = await Discount.findOne({ code });
  if (existingDiscount) {
    return res.status(400).json({ 
        message: "Mã giảm giá đã tồn tại" 
    });
  }

  const discount = await Discount.create({
    code,
    type,
    value,
    maxDiscount,
    minOrderValue,
    usageLimit,
    startDate,
    endDate,
  });

  res.status(201).json({
    message: "Tạo mã giảm giá thành công",
    discount,
  });
});

export const applyDiscount = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { code } = req.body;

  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  const discount = await Discount.findOne({ code, isActive: true });

  if (!discount) {
    return res.status(400).json({ 
      message: "Mã giảm giá không hợp lệ" });
  }

  const now = new Date();
  if (now < discount.startDate || now > discount.endDate) {
    return res.status(400).json({ 
      message: "Mã giảm giá đã hết hạn" });
  }

  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return res.status(400).json({ 
      message: "Mã giảm giá đã hết lượt sử dụng" });
  }

  if (discount.minOrderValue && cart.totalPrice < discount.minOrderValue) {
    return res.status(400).json({
      message: `Đơn hàng tối thiểu ${discount.minOrderValue}đ`,
    });
  }

  let discountAmount = 0;

  if (discount.type === "percentage") {
    discountAmount = (cart.totalPrice * discount.value) / 100;
    if (discount.maxDiscount) {
      discountAmount = Math.min(discountAmount, discount.maxDiscount);
    }
  }

  if (discount.type === "fixed") {
    discountAmount = discount.value;
  }

  if (discount.type === "freeship") {
    discountAmount = cart.shippingFee || 0;
  }

  cart.discount = {
    code: discount.code,
    amount: discountAmount,
  };

  cart.calculateTotals();
  await cart.save();

  res.json({
    success: true,
    message: "Áp dụng mã giảm giá thành công",
    data: {
      discount: {
        code: discount.code,
        amount: discountAmount,
        type: discount.type,
      },
      totalPrice: cart.totalPrice,
      finalTotal: cart.finalTotal,
    },
  });
});


export const getAllDiscounts = catchAsync(async (req, res) => {
  const discounts = await Discount.find().sort({ createdAt: -1 });

  res.status(200).json({
    results: discounts.length,
    discounts,
  });
});

export const removeDiscount = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
  }

  cart.discount = null;
  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Đã huỷ mã giảm giá",
    data: { cart },
  });
});
