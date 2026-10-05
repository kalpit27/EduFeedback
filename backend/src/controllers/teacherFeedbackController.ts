import { Response, NextFunction } from 'express';
import { TeacherFeedback } from '../models/TeacherFeedback.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../types/index.js';
import { teacherFeedbackSchema } from '../validators/index.js';

export const createTeacherFeedback = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ success: false, message: 'Forbidden: Only teachers can submit student evaluations.' });
      return;
    }

    const validated = teacherFeedbackSchema.parse(req.body);
    const { department, course, academicClass } = req.body;

    const feedback = await TeacherFeedback.create({
      ...validated,
      teacher: req.user.id,
      department,
      course,
      academicClass,
      date: new Date(),
    });

    // Notify student
    await Notification.create({
      recipient: validated.student,
      title: 'New Teacher Remarks & Evaluation',
      message: 'Your instructor has posted new academic remarks on your progress.',
      type: 'TEACHER_FEEDBACK',
      link: '/student/remarks',
    });

    // Notify parent
    const studentProfile = await StudentProfile.findOne({ user: validated.student });
    if (studentProfile && studentProfile.parents.length > 0) {
      for (const parentId of studentProfile.parents) {
        await Notification.create({
          recipient: parentId,
          title: 'Teacher Feedback for Your Child',
          message: `Academic feedback and remarks have been published for your ward.`,
          type: 'TEACHER_FEEDBACK',
          link: '/parent/feedback',
        });
      }
    }

    const populated = await TeacherFeedback.findById(feedback._id)
      .populate('teacher', 'name email employeeId avatar')
      .populate('student', 'name studentId email')
      .populate('subject', 'name code');

    res.status(201).json({ success: true, message: 'Teacher feedback recorded successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const getStudentRemarks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = req.params.studentId || req.user?.id;
    const remarks = await TeacherFeedback.find({ student: studentId })
      .populate('teacher', 'name email employeeId avatar')
      .populate('subject', 'name code')
      .populate('semester', 'name semesterNumber')
      .sort({ date: -1 });

    res.json({ success: true, count: remarks.length, data: remarks });
  } catch (error) {
    next(error);
  }
};

export const getTeacherSubmittedRemarks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const remarks = await TeacherFeedback.find({ teacher: req.user?.id })
      .populate('student', 'name studentId email')
      .populate('subject', 'name code')
      .populate('semester', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: remarks.length, data: remarks });
  } catch (error) {
    next(error);
  }
};
