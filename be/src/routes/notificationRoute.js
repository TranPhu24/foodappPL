import express from "express";
import {
  createNotification,
  deleteNotification,
  getAllNotifications
} from "../controllers/notificationController.js";

import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",protectedRoute,authorizeRoles("admin"), createNotification);

router.get("/",protectedRoute,authorizeRoles("admin"),getAllNotifications);

router.delete("/:id",protectedRoute,authorizeRoles("admin"),deleteNotification);

export default router;
