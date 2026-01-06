import express from "express";
import {
  createVNPayPayment,
  vnpayReturn,
} from "../controllers/paymentController.js";
import { auditLog } from "../middlewares/auditLogMiddleware.js";


const router = express.Router();

router.post("/vnpay/create", auditLog("CREATE_VNPAY_PAYMENT", "PAYMENT"), createVNPayPayment);
router.get("/vnpay/return", auditLog("RETURN_VNPAY_PAYMENT", "PAYMENT"), vnpayReturn);

export default router;
