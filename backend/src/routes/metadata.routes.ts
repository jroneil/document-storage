import express from 'express';
import { metadataController } from '../controllers/metadata.controller';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(auth, adminAuth);

router.post('/', metadataController.createField);
router.get('/', metadataController.getFields);
router.put('/:id', metadataController.updateField);
router.delete('/:id', metadataController.deleteField);

export default router;