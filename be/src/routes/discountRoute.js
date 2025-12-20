import express from "express";
import {
  createDiscount,
  applyDiscount,
  getAllDiscounts,
} from "../controllers/discountController.js";

import {protectedRoute,authorizeRoles,} from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/",protectedRoute,authorizeRoles("admin"),createDiscount);


router.post("/apply",protectedRoute,authorizeRoles("user"),applyDiscount);

router.get("/",protectedRoute,authorizeRoles("admin", "employee"),getAllDiscounts);

export default router;
