import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";
import { auditLog } from "../middlewares/auditLogMiddleware.js";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */


/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Tạo đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 example: COD
 *               note:
 *                 type: string
 *                 example: Giao giờ hành chính
 *               addressId:
 *                 type: string
 *                 example: 64fabc123456
 *               newAddress:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: Nguyễn Văn A
 *                   phone:
 *                     type: string
 *                     example: 0901234567
 *                   address:
 *                     type: string
 *                     example: 123 Lê Lợi
 *                   city:
 *                     type: string
 *                     example: Hà Nội
 *                   ward:
 *                     type: string
 *                     example: Phường Bến Nghé
 *                   saveAddress:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *       400:
 *         description: Giỏ hàng trống hoặc dữ liệu không hợp lệ
 */

router.post("/", protectedRoute, authorizeRoles("user"), auditLog("CREATE_ORDER", "ORDER"), createOrder);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của người dùng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 */
router.get("/my-orders", protectedRoute, authorizeRoles("user"), getMyOrders);


/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 650abc123456
 *     responses:
 *       200:
 *         description: Lấy chi tiết đơn hàng thành công
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.get("/:id", protectedRoute, getOrderById);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Huỷ đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Đổi ý không mua nữa
 *     responses:
 *       200:
 *         description: Huỷ đơn hàng thành công
 *       400:
 *         description: Không thể huỷ đơn
 *       403:
 *         description: Không có quyền
 */

router.put("/:id/cancel", protectedRoute, auditLog("CANCEL_ORDER", "ORDER"), cancelOrder);

router.get("/", protectedRoute, getAllOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, preparing, shipping, completed]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       403:
 *         description: Không có quyền
 */
router.put("/:id/status",protectedRoute,authorizeRoles("employee"), auditLog("UPDATE_ORDER_STATUS", "ORDER"), updateOrderStatus);

export default router;
