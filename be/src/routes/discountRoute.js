import express from "express";
import {
  createDiscount,
  applyDiscount,
  getAllDiscounts,
  removeDiscount,
  deleteDiscount
} from "../controllers/discountController.js";

import {protectedRoute,authorizeRoles,} from "../middlewares/authMiddleware.js";
import { auditLog } from "../middlewares/auditLogMiddleware.js";


const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Discount
 *   description: Discount & Coupon APIs
 */

/**
 * @swagger
 * /discounts:
 *   post:
 *     summary: Tạo mã giảm giá (Admin)
 *     tags: [Discount]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - type
 *               - value
 *               - startDate
 *               - endDate
 *             properties:
 *               code:
 *                 type: string
 *                 example: SALE10
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed, freeship]
 *                 example: percentage
 *               value:
 *                 type: number
 *                 example: 10
 *               maxDiscount:
 *                 type: number
 *                 example: 50000
 *               minOrderValue:
 *                 type: number
 *                 example: 200000
 *               usageLimit:
 *                 type: number
 *                 example: 100
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tạo mã giảm giá thành công
 *       400:
 *         description: Mã giảm giá đã tồn tại
 */

router.post("/",protectedRoute,authorizeRoles("admin"), auditLog("CREATE_DISCOUNT", "DISCOUNT"), createDiscount);

/**
 * @swagger
 * /discounts/apply:
 *   post:
 *     summary: Áp dụng mã giảm giá vào giỏ hàng
 *     tags: [Discount]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: SALE10
 *     responses:
 *       200:
 *         description: Áp dụng mã giảm giá thành công
 *       400:
 *         description: Mã giảm giá không hợp lệ hoặc không đủ điều kiện
 */

router.post("/apply",protectedRoute,authorizeRoles("user"), auditLog("APPLY_DISCOUNT", "DISCOUNT"), applyDiscount);

/**
 * @swagger
 * /discounts/remove:
 *   delete:
 *     summary: Huỷ mã giảm giá trong giỏ hàng
 *     tags: [Discount]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Huỷ mã giảm giá thành công
 *       404:
 *         description: Không tìm thấy giỏ hàng
 */
router.post("/remove",protectedRoute,authorizeRoles("user"),removeDiscount);

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: Lấy danh sách mã giảm giá
 *     tags: [Discount]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách mã giảm giá
 */
router.get("/",protectedRoute,authorizeRoles("admin", "employee"),getAllDiscounts);

router.delete("/:id",protectedRoute,authorizeRoles("admin"), auditLog("DELETE_DISCOUNT", "DISCOUNT"), deleteDiscount);

export default router;
