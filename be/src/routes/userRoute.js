import express from 'express';
import { createEmployee,
        getAllEmployees, 
        deleteEmployee } from '../controllers/userController.js';
import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post('/employees', protectedRoute, authorizeRoles("admin"), createEmployee);
router.get('/employees', protectedRoute, authorizeRoles("admin"), getAllEmployees);
router.delete('/employees/:id', protectedRoute, authorizeRoles("admin"), deleteEmployee);

export default router;