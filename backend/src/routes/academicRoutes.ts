import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getClasses,
  createClass,
  getSemesters,
  createSemester,
  getSubjects,
  createSubject,
  getTeacherAssignments,
  createTeacherAssignment,
  deleteTeacherAssignment,
} from '../controllers/academicController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

// Public / Authenticated reads
router.get('/departments', authenticateJWT, getDepartments);
router.post('/departments', authenticateJWT, requireAdmin, createDepartment);
router.put('/departments/:id', authenticateJWT, requireAdmin, updateDepartment);
router.delete('/departments/:id', authenticateJWT, requireAdmin, deleteDepartment);

router.get('/courses', authenticateJWT, getCourses);
router.post('/courses', authenticateJWT, requireAdmin, createCourse);
router.put('/courses/:id', authenticateJWT, requireAdmin, updateCourse);
router.delete('/courses/:id', authenticateJWT, requireAdmin, deleteCourse);

router.get('/classes', authenticateJWT, getClasses);
router.post('/classes', authenticateJWT, requireAdmin, createClass);

router.get('/semesters', authenticateJWT, getSemesters);
router.post('/semesters', authenticateJWT, requireAdmin, createSemester);

router.get('/subjects', authenticateJWT, getSubjects);
router.post('/subjects', authenticateJWT, requireAdmin, createSubject);

router.get('/teacher-assignments', authenticateJWT, getTeacherAssignments);
router.post('/teacher-assignments', authenticateJWT, requireAdmin, createTeacherAssignment);
router.delete('/teacher-assignments/:id', authenticateJWT, requireAdmin, deleteTeacherAssignment);

export default router;
