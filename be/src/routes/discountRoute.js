import express from "express";
import {
  createDiscount,
  applyDiscount,
  getAllDiscounts,
  removeDiscount
} from "../controllers/discountController.js";

import {protectedRoute,authorizeRoles,} from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/",protectedRoute,authorizeRoles("admin"),createDiscount);

router.post("/apply",protectedRoute,authorizeRoles("user"),applyDiscount);
router.post("/remove",protectedRoute,authorizeRoles("user"),removeDiscount);

router.get("/",protectedRoute,authorizeRoles("admin", "employee"),getAllDiscounts);

export default router;
