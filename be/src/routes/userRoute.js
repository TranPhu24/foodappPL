import express from 'express';
import { createEmployee,
        getAllEmployees, 
        deleteEmployee,
        getMe,
        addFavoriteProduct,
        removeFavoriteProduct,
        getAllFavoriteProducts
} from '../controllers/userController.js';
import { protectedRoute, authorizeRoles } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post('/employees', protectedRoute, authorizeRoles("admin"), createEmployee);
router.get('/employees', protectedRoute, authorizeRoles("admin"), getAllEmployees);
router.delete('/employees/:id', protectedRoute, authorizeRoles("admin"), deleteEmployee);

router.get('/me', protectedRoute, getMe);

router.post('/favorite', protectedRoute, addFavoriteProduct);
router.delete('/favorite/:productId', protectedRoute, removeFavoriteProduct);
router.get('/favorite', protectedRoute, getAllFavoriteProducts);


export default router;