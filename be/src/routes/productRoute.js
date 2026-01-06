import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";
import { auditLog } from "../middlewares/auditLogMiddleware.js";

import upload from "../utils/cloudinaryUpload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product APIs
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               category: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 */
router.post("/", upload.single("image"), protectedRoute, authorizeRoles("admin"), auditLog("CREATE_PRODUCT", "PRODUCT"), createProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 */
router.get("/:id", getProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/:id", protectedRoute, authorizeRoles("admin"),upload.single("image"), auditLog("UPDATE_PRODUCT", "PRODUCT"), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/:id", protectedRoute, authorizeRoles("admin"), auditLog("DELETE_PRODUCT", "PRODUCT"), deleteProduct);



export default router;
