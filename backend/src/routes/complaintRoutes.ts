import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id', requireAdmin, updateComplaintStatus);

export default router;
