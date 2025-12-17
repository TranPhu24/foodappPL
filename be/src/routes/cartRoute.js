import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController.js";

import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protectedRoute, getCart);
router.post("/", protectedRoute,authorizeRoles("user"), addToCart);
router.put("/", protectedRoute,authorizeRoles("user"),  updateCartItem);
router.delete("/:productId", protectedRoute,authorizeRoles("user"),  removeCartItem);

export default router;
