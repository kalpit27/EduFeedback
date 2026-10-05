import { Router } from 'express';
import {
  getSystemSettings,
  updateSystemSettings,
} from '../controllers/settingsController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getSystemSettings);
router.put('/', requireAdmin, updateSystemSettings);

export default router;
