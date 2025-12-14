import Cart from "../models/cart.js";
import Product from "../models/product.js";
import catchAsync from "../utils/catchAsync.js";


export const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  const qty = quantity || 1;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  if (product.stock < qty) {
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
    cart.items[itemIndex].quantity += qty;
  } else {
    cart.items.push({
      product: productId,
      quantity: qty,
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

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  const oldQuantity = item.quantity;
  const diff = quantity - oldQuantity; 

  if (diff > 0) {
    if (product.stock < diff) {
      return res.status(400).json({
        message: "Số lượng sản phẩm trong kho không đủ",
      });
    }
    product.stock -= diff;
  }

  if (diff < 0) {
    product.stock += Math.abs(diff);
  }

  item.quantity = quantity;

  await product.save();
  cart.calculateTotals();
  await cart.save();

  res.json({
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

  const removedItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!removedItem) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại trong giỏ hàng",
    });
  }

  const product = await Product.findById(productId);
  if (product) {
    product.stock += removedItem.quantity;
    await product.save();
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



