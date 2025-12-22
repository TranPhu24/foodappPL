import Cart from "../models/cart.js";
import Product from "../models/product.js";
import catchAsync from "../utils/catchAsync.js";
import Discount from "../models/discount.js";


export const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.id;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      message: "Số lượng sản phẩm trong kho không đủ",
    });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    const newQty = cart.items[itemIndex].quantity + quantity;

    if (newQty > product.stock) {
      return res.status(400).json({
        message: "Số lượng sản phẩm trong kho không đủ",
      });
    }

    cart.items[itemIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Thêm vào giỏ hàng thành công",
    cart,
  });
});


export const getCart = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price image stock"
  );

  if (!cart || cart.items.length === 0) {
    return res.status(200).json({
      message: "Giỏ hàng trống",
      cart: null,
    });
  }

  if (cart.discount && cart.discount.code) {
    const discount = await Discount.findOne({
      code: cart.discount.code,
    });

    const now = new Date();
    let isInvalid = false;

    if (
      !discount ||
      now < discount.startDate ||
      now > discount.endDate
    ) {
      isInvalid = true;
    }

    if (
      discount?.minOrderValue &&
      cart.totalPrice < discount.minOrderValue
    ) {
      isInvalid = true;
    }

    if (
      discount?.usageLimit &&
      discount.usedCount >= discount.usageLimit
    ) {
      isInvalid = true;
    }

    if (isInvalid) {
      cart.discount = null;
      cart.calculateTotals();
      await cart.save();
    }
  }

  res.status(200).json({
    message: "Lấy giỏ hàng thành công",
    cart,
  });
});



export const updateCartItem = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (quantity <= 0) {
    return res.status(400).json({
      message: "Số lượng phải lớn hơn 0",
    });
  }

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
      message: "Sản phẩm không tồn tại trong giỏ hàng",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  if (quantity > product.stock) {
    return res.status(400).json({
      message: "Số lượng sản phẩm trong kho không đủ",
    });
  }

  item.quantity = quantity;

  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    message: "Cập nhật giỏ hàng thành công",
    cart,
  });
});


export const removeCartItem = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({
      message: "Không tìm thấy giỏ hàng",
    });
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại trong giỏ hàng",
    });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Xóa sản phẩm khỏi giỏ hàng thành công",
    cart,
  });
});

