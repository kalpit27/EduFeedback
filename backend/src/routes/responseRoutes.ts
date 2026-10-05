import { Router } from 'express';
import {
  submitFeedback,
  getTeacherSubmissionStatus,
  getAdminFormResponses,
} from '../controllers/responseController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireAdmin, requireTeacher } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

// Student Submit Feedback
router.post('/:id/responses', submitFeedback);

// Teacher Submission Count/Participation (Confidentiality enforced strictly)
router.get('/:id/submission-status', requireTeacher, getTeacherSubmissionStatus);

// Admin View Responses
router.get('/:id/responses', requireAdmin, getAdminFormResponses);

export default router;
