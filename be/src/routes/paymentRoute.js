import express from "express";
import {
  createVNPayPayment,
  vnpayReturn,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/vnpay/create", createVNPayPayment);
router.get("/vnpay/return", vnpayReturn);

export default router;
