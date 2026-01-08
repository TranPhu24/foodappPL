import vnpay from "../libs/vnpay.js";
import Order from "../models/order.js";
import Cart from "../models/cart.js"
import Product from "../models/product.js"
import catchAsync from "../utils/catchAsync.js";
export const createVNPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: order.totalPrice , 
      vnp_IpAddr: req.ip,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
    });

    res.json({ paymentUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Create VNPay payment failed" });
  }
};

export const vnpayReturn = catchAsync(async (req, res) => {
  try {
    const result = vnpay.verifyReturnUrl(req.query);
    const orderId = result.vnp_TxnRef;

    const FRONTEND_URL = process.env.FRONTEND_URL;

    const order = await Order.findById(orderId).populate("user");
    if (!order)
      return res.redirect(`${FRONTEND_URL}/dashboard/user/order/listorder`);

    if (order.paymentStatus === "paid") {
      return res.redirect(
        `${FRONTEND_URL}/dashboard/user/payment/payment-success?payment=success`
      );
    }

    if (result.isVerified && result.vnp_ResponseCode === "00") {
      const cart = await Cart.findOne({ user: order.user });

      if (cart) {
        await Promise.all(
          cart.items.map((item) =>
            Product.findByIdAndUpdate(item.product._id, {
              $inc: { stock: -item.quantity },
            })
          )
        );

        if (cart.discount?.code) {
          const appliedDiscount = await Discount.findOne({
            code: cart.discount.code,
          });

          if (appliedDiscount) {
            appliedDiscount.usedCount =
              (appliedDiscount.usedCount || 0) + 1;
            await appliedDiscount.save();
          }
        }

        cart.items = [];
        cart.discount = null;
        cart.totalPrice = 0;
        cart.totalQuantity = 0;
        cart.finalTotal = 0;
        await cart.save();
      }

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        isPaid: true,
        paidAt: new Date(),
      });

      return res.redirect(
        `${FRONTEND_URL}/dashboard/user/payment/payment-success?payment=success`
      );
    }

    await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    return res.redirect(`${FRONTEND_URL}/dashboard/user/order/listorder`);
  } catch (error) {
    console.error(error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?payment=error`);
  }
});




