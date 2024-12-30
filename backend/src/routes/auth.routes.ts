import { Router, Request } from 'express';
import { authController } from '../controllers/auth.controller';
import { auth, adminAuth } from '../middleware/auth';

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: any; // Replace 'any' with your actual user type if available
}

const router = Router();
router.post('/register', authController.register); 
router.post('/login', authController.login);

// Example of a protected route
router.get('/profile', auth, (req: AuthRequest, res) => {
  const user = req.user;
  res.json({ success: true, user });
});

// Example of an admin-protected route
router.get('/admin/dashboard', auth, adminAuth, (req: AuthRequest, res) => {
  // Only admins can access this route
  res.json({ success: true, message: 'Admin Dashboard' });
});

export default router;
