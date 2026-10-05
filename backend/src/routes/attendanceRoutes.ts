import { Router } from 'express';
import {
  recordAttendance,
  getAttendance,
  getStudentAttendanceSummary,
} from '../controllers/attendanceController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireTeacher } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAttendance);
router.post('/', requireTeacher, recordAttendance);
router.get('/student/:studentId', getStudentAttendanceSummary);

export default router;
