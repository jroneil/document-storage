import express from 'express';
import multer from 'multer';
import { documentController } from '../controllers/document.controller';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Public routes
router.get('/public', documentController.getDocuments);

// Protected routes
router.use(auth);
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocument);
router.delete('/:id', documentController.deleteDocument);

// Admin routes
router.use(adminAuth);
// Add admin-specific routes here if needed

export default router;