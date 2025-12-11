import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protectedRoute, addToCart);

router.get("/", protectedRoute, getCart);

router.put("/", protectedRoute, updateCartItem);

router.delete("/:productId", protectedRoute, removeCartItem);

router.delete("/", protectedRoute, clearCart);

export default router;
