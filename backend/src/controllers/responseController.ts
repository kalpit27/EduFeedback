import { Response, NextFunction } from 'express';
import { FeedbackResponse } from '../models/FeedbackResponse.js';
import { FeedbackForm } from '../models/FeedbackForm.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../types/index.js';
import { feedbackResponseSchema } from '../validators/index.js';

// Student Submit Feedback
export const submitFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'STUDENT' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ success: false, message: 'Forbidden: Only students can submit feedback.' });
      return;
    }

    const { id: formId } = req.params;
    const validated = feedbackResponseSchema.parse(req.body);

    const form = await FeedbackForm.findById(formId);
    if (!form) {
      res.status(404).json({ success: false, message: 'Feedback form not found.' });
      return;
    }

    if (form.status !== 'PUBLISHED') {
      res.status(400).json({ success: false, message: 'This form is currently not accepting responses.' });
      return;
    }

    // Check duplicate submission
    const existing = await FeedbackResponse.findOne({ student: req.user.id, form: formId });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Feedback already submitted. You cannot submit multiple times.',
        errorType: 'ALREADY_SUBMITTED',
      });
      return;
    }

    // Create response
    const response = await FeedbackResponse.create({
      form: form._id,
      student: req.user.id,
      teacher: form.teacher,
      department: form.department,
      course: form.course,
      academicClass: form.academicClass,
      semester: form.semester,
      subject: form.subject,
      answers: validated.answers,
      submittedAt: new Date(),
    });

    // Notify student
    await Notification.create({
      recipient: req.user.id,
      title: 'Feedback Submitted Successfully',
      message: `Your feedback for "${form.title}" has been securely recorded.`,
      type: 'FEEDBACK_SUBMITTED',
      link: '/student/history',
    });

    // Notify teacher anonymously (count update only)
    if (form.teacher) {
      await Notification.create({
        recipient: form.teacher,
        title: 'New Student Feedback Submitted',
        message: `A student has submitted feedback for ${form.title}. Check participation progress on your dashboard.`,
        type: 'FEEDBACK_SUBMITTED',
        link: '/teacher/feedback',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: {
        id: response._id,
        submittedAt: response.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Teacher Submission Status (CONFIDENTIAL: Strictly aggregated counts ONLY)
export const getTeacherSubmissionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id: formId } = req.params;
    const form = await FeedbackForm.findById(formId)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name code');

    if (!form) {
      res.status(404).json({ success: false, message: 'Form not found.' });
      return;
    }

    // If requester is teacher, ensure they are the assigned teacher
    if (req.user.role === 'TEACHER' && form.teacher?.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You are not assigned to this feedback form.',
      });
      return;
    }

    // Count eligible students matching form's academic scope
    const studentQuery: any = { department: form.department };
    if (form.course) studentQuery.course = form.course;
    if (form.academicClass) studentQuery.academicClass = form.academicClass;
    if (form.semester) studentQuery.semester = form.semester;

    const totalStudents = await StudentProfile.countDocuments(studentQuery);
    const submittedCount = await FeedbackResponse.countDocuments({ form: formId });
    const pendingCount = Math.max(0, totalStudents - submittedCount);
    const participationPercentage =
      totalStudents > 0 ? Number(((submittedCount / totalStudents) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: {
        formId: form._id,
        formTitle: form.title,
        formType: form.formType,
        department: form.department,
        course: form.course,
        academicClass: form.academicClass,
        semester: form.semester,
        subject: form.subject,
        status: form.status,
        totalStudents,
        submittedCount,
        pendingCount,
        participationPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin View Responses (Admin only, with full search/filter)
export const getAdminFormResponses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Confidential raw responses are restricted to Institute Admins only.' });
      return;
    }

    const { id: formId } = req.params;
    const responses = await FeedbackResponse.find({ form: formId })
      .populate('student', 'name email studentId')
      .populate('teacher', 'name email employeeId')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name')
      .populate('semester', 'name')
      .populate('subject', 'name code')
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: responses.length, data: responses });
  } catch (error) {
    next(error);
  }
};
