import express from "express";
import {
  createNotification,
  deleteNotification,
  getAllNotifications
} from "../controllers/notificationController.js";

import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification APIs
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Tạo thông báo (Admin)
 *     tags: [Notification]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 example: Thông báo khuyến mãi
 *               message:
 *                 type: string
 *                 example: Giảm giá 20% cho toàn bộ sản phẩm
 *               type:
 *                 type: string
 *                 enum: [normal, discount]
 *                 example: discount
 *               discount:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: SALE20
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       201:
 *         description: Tạo thông báo thành công
 *       400:
 *         description: Thiếu dữ liệu bắt buộc
 */
router.post("/",protectedRoute,authorizeRoles("admin"), createNotification);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lấy danh sách thông báo
 *     tags: [Notification]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
router.get("/", getAllNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Xóa thông báo
 *     tags: [Notification]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 64fa123abc
 *     responses:
 *       200:
 *         description: Xóa thông báo thành công
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.delete("/:id",protectedRoute,authorizeRoles("admin"),deleteNotification);

export default router;
