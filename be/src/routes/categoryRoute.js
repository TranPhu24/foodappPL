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
router.post("/", protectedRoute, authorizeRoles("admin"), createCategory);
router.put("/:id", protectedRoute, authorizeRoles("admin"), updateCategory);
router.delete("/:id", protectedRoute, authorizeRoles("admin"), deleteCategory);

export default router;
