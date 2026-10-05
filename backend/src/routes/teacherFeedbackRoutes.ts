import { Router } from 'express';
import {
  createTeacherFeedback,
  getStudentRemarks,
  getTeacherSubmittedRemarks,
} from '../controllers/teacherFeedbackController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireTeacher } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', requireTeacher, createTeacherFeedback);
router.get('/my-submissions', requireTeacher, getTeacherSubmittedRemarks);
router.get('/student/:studentId', getStudentRemarks);

export default router;
