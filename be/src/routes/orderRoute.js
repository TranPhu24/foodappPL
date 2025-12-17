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

router.get("/:id", protectedRoute, getOrderById);
router.put("/:id/cancel", protectedRoute, cancelOrder);

router.get("/", protectedRoute, getAllOrders);
router.put("/:id/status",protectedRoute,authorizeRoles("employee"),updateOrderStatus);

export default router;
