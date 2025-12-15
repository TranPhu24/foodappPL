import vnpay from "../libs/vnpay.js";
import Order from "../models/order.js";
import Cart from "../models/cart.js"
import Product from "../models/product.js"

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

export const vnpayReturn = async (req, res) => {
  try {
    const result = vnpay.verifyReturnUrl(req.query);
    const orderId = result.vnp_TxnRef;

    if (result.isSuccess && result.isVerified) {
      const order = await Order.findById(orderId).populate("user");

      if (!order || order.paymentStatus === "paid") {
        return res.redirect(
          "http://localhost:3000/dashboard/user/payment/payment-success?payment=success"
        );
      }

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        isPaid: true,
        paidAt: new Date(),
      });

      const cart = await Cart.findOne({ user: order.user });
      if (cart) {
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

      return res.redirect(
        "http://localhost:3000/dashboard/user/payment/payment-success?payment=success"
      );
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "failed",
    });

    return res.redirect(
      "http://localhost:3000/dashboard/user/order/listorder"
    );
  } catch (error) {
    return res.redirect(
      "http://localhost:3000/payment-failed?payment=error"
    );
  }
};


