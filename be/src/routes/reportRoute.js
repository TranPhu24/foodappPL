import express from "express";
import { getRevenueReport } from "../controllers/reportController.js";
import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/revenue",protectedRoute,authorizeRoles("admin"),getRevenueReport);

export default router;
