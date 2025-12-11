import Cart from "../models/cart.js";
import Product from "../models/product.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity || 1;
  } else {
    cart.items.push({
      product: productId,
      quantity: quantity || 1,
      price: product.price,
    });
  }

  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    message: "Thêm vào giỏ hàng thành công",
    cart,
  });
});

/**
 * Lấy giỏ hàng của user
 */
export const getCart = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price image"
  );

  if (!cart) {
    return res.status(200).json({
      message: "Giỏ hàng trống",
      cart: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Lấy giỏ hàng thành công",
    data: {
      cart,
    },
  });
});

/**
 * Cập nhật số lượng sản phẩm
 */
export const updateCartItem = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({
      message: "Không tìm thấy giỏ hàng",
    });
  }

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (!item) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại trong giỏ",
    });
  }

  item.quantity = quantity;

  cart.calculateTotals();
  await cart.save();

  res.json({
    message: "Cập nhật giỏ hàng thành công",
    cart,
  });
});

/**
 * Xoá 1 sản phẩm khỏi giỏ
 */
export const removeCartItem = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({
      message: "Không tìm thấy giỏ hàng",
    });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.calculateTotals();
  await cart.save();

  res.json({
    message: "Xoá sản phẩm khỏi giỏ thành công",
    cart,
  });
});

/**
 * Xoá toàn bộ giỏ hàng
 */
export const clearCart = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({
      message: "Không tìm thấy giỏ hàng",
    });
  }

  cart.items = [];
  cart.totalPrice = 0;
  cart.totalQuantity = 0;

  await cart.save();

  res.json({
    message: "Đã xoá toàn bộ giỏ hàng",
    cart,
  });
});
