import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController.js";

import {
  protectedRoute,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping Cart APIs
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Lấy giỏ hàng của người dùng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy giỏ hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/", protectedRoute, getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64fa12abc123
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Thêm vào giỏ hàng thành công
 *       403:
 *         description: Không có quyền (chỉ user)
 */
router.post("/", protectedRoute, authorizeRoles("user"), addToCart);


/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64fa12abc123
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cập nhật giỏ hàng thành công
 */
router.put("/", protectedRoute, authorizeRoles("user"), updateCartItem);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64fa12abc123
 *     responses:
 *       200:
 *         description: Xóa sản phẩm thành công
 *       404:
 *         description: Không tìm thấy sản phẩm trong giỏ
 */
router.delete("/:productId",protectedRoute,authorizeRoles("user"),removeCartItem);

export default router;
