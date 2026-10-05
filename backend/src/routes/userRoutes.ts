import { Router } from 'express';
import {
  getTeachers,
  createTeacher,
  getStudents,
  createStudent,
  getParents,
  createParent,
  updateUserStatus,
} from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

router.get('/teachers', getTeachers);
router.post('/teachers', requireAdmin, createTeacher);

router.get('/students', getStudents);
router.post('/students', requireAdmin, createStudent);

router.get('/parents', getParents);
router.post('/parents', requireAdmin, createParent);

router.patch('/users/:id/status', requireAdmin, updateUserStatus);

export default router;
