import { Router } from 'express';
import {
  getAdminOverviewAnalytics,
  getFormDetailedAnalytics,
} from '../controllers/analyticsController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

// Admin-level multi-department institutional analytics overview
router.get('/overview', requireAdmin, getAdminOverviewAnalytics);

// Admin-level detailed form analytics
router.get('/forms/:id', requireAdmin, getFormDetailedAnalytics);

export default router;
