import express from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category APIs
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Tạo category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", protectedRoute, authorizeRoles("admin"), createCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lấy danh sách category
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Danh sách category
 */

//user
router.get("/", getCategories);
router.get("/:id", getCategory);

// admin
/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Cập nhật category
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 64fa123abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Điện thoại
 *               description:
 *                 type: string
 *                 example: Các sản phẩm điện thoại
 *     responses:
 *       200:
 *         description: Cập nhật category thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy category
 */
router.put("/:id", protectedRoute, authorizeRoles("admin"), updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Xóa category
 *     tags: [Category]
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
 *         description: Xóa category thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy category
 */

router.delete("/:id", protectedRoute, authorizeRoles("admin"), deleteCategory);

export default router;
