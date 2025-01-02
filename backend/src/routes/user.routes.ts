import express from 'express';
import { userController } from '../controllers/user.controller';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(auth, adminAuth);
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/me', userController.getCurrentUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;