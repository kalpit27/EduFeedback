import { Response, NextFunction } from 'express';
import { FeedbackForm } from '../models/FeedbackForm.js';
import { FeedbackResponse } from '../models/FeedbackResponse.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AuthenticatedRequest } from '../types/index.js';
import { feedbackFormSchema } from '../validators/index.js';

// Get all forms (Admin / Staff query)
export const getForms = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, course, academicClass, semester, subject, teacher, status, formType } = req.query;
    const query: any = {};

    if (department) query.department = department;
    if (course) query.course = course;
    if (academicClass) query.academicClass = academicClass;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;
    if (teacher) query.teacher = teacher;
    if (status) query.status = status;
    if (formType) query.formType = formType;

    const forms = await FeedbackForm.find(query)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name code')
      .populate('teacher', 'name email employeeId avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: forms.length, data: forms });
  } catch (error) {
    next(error);
  }
};

// Get single form by ID
export const getFormById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const form = await FeedbackForm.findById(id)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name code')
      .populate('teacher', 'name email employeeId avatar')
      .populate('createdBy', 'name email');

    if (!form) {
      res.status(404).json({ success: false, message: 'Feedback form not found.' });
      return;
    }

    res.json({ success: true, data: form });
  } catch (error) {
    next(error);
  }
};

// Create new dynamic feedback form
export const createForm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const validated = feedbackFormSchema.parse(req.body);
    const form = await FeedbackForm.create({
      ...validated,
      createdBy: req.user.id,
    });

    const populated = await FeedbackForm.findById(form._id)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name code')
      .populate('teacher', 'name email');

    res.status(201).json({ success: true, message: 'Form created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

// Update form
export const updateForm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await FeedbackForm.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name code')
      .populate('teacher', 'name email');

    if (!updated) {
      res.status(404).json({ success: false, message: 'Form not found.' });
      return;
    }

    res.json({ success: true, message: 'Form updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

// Publish form
export const publishForm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const form = await FeedbackForm.findByIdAndUpdate(id, { status: 'PUBLISHED' }, { new: true });
    if (!form) {
      res.status(404).json({ success: false, message: 'Form not found.' });
      return;
    }
    res.json({ success: true, message: 'Form published successfully for students.', data: form });
  } catch (error) {
    next(error);
  }
};

// Close form
export const closeForm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const form = await FeedbackForm.findByIdAndUpdate(id, { status: 'CLOSED' }, { new: true });
    if (!form) {
      res.status(404).json({ success: false, message: 'Form not found.' });
      return;
    }
    res.json({ success: true, message: 'Form closed. Submissions are no longer accepted.', data: form });
  } catch (error) {
    next(error);
  }
};

// Delete form
export const deleteForm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await FeedbackForm.findByIdAndDelete(id);
    await FeedbackResponse.deleteMany({ form: id });
    res.json({ success: true, message: 'Form and associated responses deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Student Available Forms (Academic scope enforced + submitted status tagged)
export const getStudentAvailableForms = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      res.status(404).json({ success: false, message: 'Student academic profile not found.' });
      return;
    }

    // Strict Academic Isolation Query:
    // Form must match student's Department, Course, Class, and Semester (or institute general form)
    const forms = await FeedbackForm.find({
      status: 'PUBLISHED',
      department: studentProfile.department,
      $or: [
        { course: studentProfile.course, semester: studentProfile.semester },
        { course: studentProfile.course, academicClass: studentProfile.academicClass },
        { formType: 'GENERAL' },
      ],
    })
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name code')
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 });

    // Fetch student's completed responses to mark completion
    const studentResponses = await FeedbackResponse.find({ student: req.user.id }).select('form submittedAt');
    const submittedFormIds = new Map(
      studentResponses.map((r) => [r.form.toString(), r.submittedAt])
    );

    const enrichedForms = forms.map((form) => {
      const isSubmitted = submittedFormIds.has(form._id.toString());
      return {
        ...form.toObject(),
        isSubmitted,
        submittedAt: isSubmitted ? submittedFormIds.get(form._id.toString()) : null,
      };
    });

    res.json({ success: true, count: enrichedForms.length, data: enrichedForms });
  } catch (error) {
    next(error);
  }
};
