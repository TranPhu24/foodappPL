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

const router = express.Router();


router.post("/", protectedRoute, authorizeRoles("user"), createOrder);

router.get("/my-orders", protectedRoute, authorizeRoles("user"), getMyOrders);

/**
 * Lấy chi tiết 1 đơn hàng
 */
router.get("/:id", protectedRoute, getOrderById);

/**
 * User huỷ đơn
 */
router.put("/:id/cancel", protectedRoute, cancelOrder);

/**
 * ADMIN: lấy tất cả đơn hàng
 */
router.get("/", protectedRoute, authorizeRoles("employee"), getAllOrders);


router.put(
  "/:id/status",
  protectedRoute,
  authorizeRoles("employee"),
  updateOrderStatus
);

export default router;
