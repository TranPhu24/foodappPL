import vnpay from "../libs/vnpay.js";
import Order from "../models/order.js";
import Cart from "../models/cart.js"
import Product from "../models/product.js"
import catchAsync from "../utils/catchAsync.js";
import Discount from "../models/discount.js";
export const createVNPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: order.finalTotal, 
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
  const FRONTEND_URL = process.env.FRONTEND_URL;

  try {
    const result = vnpay.verifyReturnUrl(req.query);
    const orderId = result.vnp_TxnRef;

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.redirect(
        `${FRONTEND_URL}/dashboard/user/order/listorder`
      );
    }

    if (order.paymentStatus === "paid") {
      return res.redirect(
        `${FRONTEND_URL}/dashboard/user/payment/payment-success?payment=success`
      );
    }

    if (result.isVerified && result.vnp_ResponseCode === "00") {

      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          })
        )
      );

      if (order.discount?.code) {
        const discount = await Discount.findOne({
          code: order.discount.code,
        });

        if (discount) {
          discount.usedCount = (discount.usedCount || 0) + 1;
          await discount.save();
        }
      }

      await Cart.findOneAndUpdate(
        { user: order.user._id },
        {
          items: [],
          discount: null,
          totalPrice: 0,
          totalQuantity: 0,
          finalTotal: 0,
        }
      );

      order.paymentStatus = "paid";
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();

      return res.redirect(
        `${FRONTEND_URL}/dashboard/user/payment/payment-success?payment=success`
      );
    }

    order.paymentStatus = "failed";
    await order.save();

    return res.redirect(
      `${FRONTEND_URL}/dashboard/user/order/listorder`
    );

  } catch (error) {
    console.error("VNPay return error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?payment=error`
    );
  }
});




