import { Router } from 'express';
import authRoutes from './authRoutes.js';
import academicRoutes from './academicRoutes.js';
import userRoutes from './userRoutes.js';
import formRoutes from './formRoutes.js';
import responseRoutes from './responseRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import teacherFeedbackRoutes from './teacherFeedbackRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', academicRoutes);
router.use('/', userRoutes);
router.use('/forms', formRoutes);
router.use('/forms', responseRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/teacher-feedback', teacherFeedbackRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);

export default router;
