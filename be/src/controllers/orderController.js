import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import catchAsync from "../utils/catchAsync.js";


export const createOrder = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod = "COD", note = "" } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price stock image"
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  // check stock
  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      return res.status(400).json({
        message: `Sản phẩm "${item.product.name}" chỉ còn ${item.product.stock}`,
      });
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    price: item.price,
    quantity: item.quantity,
  }));

  const totalPrice = cart.totalPrice;
  const shippingFee = 0;
  const discount = 0;
  const finalTotal = totalPrice + shippingFee - discount;

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    note: note.trim(),
    totalPrice,
    shippingFee,
    discount,
    finalTotal,
    paymentStatus: paymentMethod === "COD" ? "paid" : "pending",
    orderStatus: "pending",
    isPaid: paymentMethod === "COD",
    paidAt: paymentMethod === "COD" ? new Date() : null,
  });

  // ✅ CHỈ COD mới xử lý kho + cart
  if (paymentMethod === "COD") {
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    cart.totalPrice = 0;
    cart.totalQuantity = 0;
    await cart.save();
  }

  res.status(201).json({
    success: true,
    data: { order },
  });
});



export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});


export const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "username email")
    .populate("handledBy", "username email");

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  if (
    order.user._id.toString() !== req.user.id &&
    req.user.role !== "employee"
  ) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  res.json({ success: true, order });
});


export const getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "username email")
    .populate("handledBy", "username email")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});


export const updateOrderStatus = catchAsync(async (req, res) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({ message: "Không có quyền" });
  }

  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  if (["cancelled", "completed"].includes(order.orderStatus)) {
    return res.status(400).json({
      message: "Không thể cập nhật đơn hàng đã kết thúc",
    });
  }

  const now = new Date();

  switch (status) {
    case "confirmed":
      order.confirmedAt = now;
      break;
    case "preparing":
      order.preparingAt = now;
      break;
    case "shipping":
      order.shippingAt = now;
      break;
    case "completed":
      order.completedAt = now;
      break;

    default:
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  order.orderStatus = status;
  order.handledBy = req.user.id;

  await order.save();

  res.json({
    success: true,
    message: "Cập nhật trạng thái đơn hàng thành công",
    order,
  });
});


export const cancelOrder = catchAsync(async (req, res) => {
  const { reason } = req.body || {};

  if (!reason) {
    return res.status(400).json({
      message: "Vui lòng cung cấp lý do huỷ đơn",
    });
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  const isOwner = order.user.toString() === req.user.id;
  const isEmployee = req.user.role === "employee";

  if (!isOwner && !isEmployee) {
    return res.status(403).json({ message: "Không có quyền hủy đơn" });
  }

  // user chỉ hủy khi pending
  if (isOwner && order.orderStatus !== "pending") {
    return res.status(400).json({
      message: "Đơn hàng đã được xử lý, không thể hủy",
    });
  }

  // hoàn kho
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = "cancelled";
  order.cancelledBy = isEmployee ? "employee" : "user";
  order.cancelReason = reason;
  order.cancelledAt = new Date();
  order.handledBy = isEmployee ? req.user.id : null;

  await order.save();

  res.json({
    success: true,
    message: "Đã hủy đơn hàng",
    order,
  });
});
