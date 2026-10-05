import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']),
  phone: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  studentId: z.string().optional(),
  linkedStudents: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  code: z.string().min(2, 'Code is required').max(10),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const courseSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  code: z.string().min(2, 'Course code is required'),
  department: z.string().min(1, 'Department is required'),
  durationYears: z.number().min(1).max(6).default(3),
  totalSemesters: z.number().min(1).max(12).default(6),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const academicClassSchema = z.object({
  name: z.string().min(1, 'Class/Year name is required (e.g. FY, SY, TY)'),
  division: z.string().default('A'),
  course: z.string().min(1, 'Course is required'),
  department: z.string().min(1, 'Department is required'),
  academicYear: z.string().default('2025-2026'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const semesterSchema = z.object({
  name: z.string().min(1, 'Semester name is required (e.g. Semester I)'),
  semesterNumber: z.number().min(1).max(12),
  course: z.string().min(1, 'Course is required'),
  academicClass: z.string().min(1, 'Class is required'),
  department: z.string().min(1, 'Department is required'),
  academicYear: z.string().default('2025-2026'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(2, 'Subject code is required'),
  department: z.string().min(1, 'Department is required'),
  course: z.string().min(1, 'Course is required'),
  academicClass: z.string().min(1, 'Class is required'),
  semester: z.string().min(1, 'Semester is required'),
  credits: z.number().min(1).max(10).default(4),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const teacherAssignmentSchema = z.object({
  teacher: z.string().min(1, 'Teacher is required'),
  department: z.string().min(1, 'Department is required'),
  course: z.string().min(1, 'Course is required'),
  academicClass: z.string().min(1, 'Class is required'),
  semester: z.string().min(1, 'Semester is required'),
  subject: z.string().min(1, 'Subject is required'),
  academicYear: z.string().default('2025-2026'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(2, 'Question text cannot be empty'),
  description: z.string().optional(),
  type: z.enum([
    'STAR_RATING',
    'MULTIPLE_CHOICE',
    'CHECKBOX',
    'DROPDOWN',
    'YES_NO',
    'TEXT',
    'LONG_TEXT',
    'RATING_SCALE',
    'NUMBER_RATING',
  ]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  category: z.string().default('General'),
  order: z.number().default(0),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const feedbackFormSchema = z.object({
  title: z.string().min(3, 'Form title must be at least 3 characters'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  formType: z.enum([
    'STUDENT_TO_TEACHER',
    'TEACHER_TO_STUDENT',
    'PARENT_TO_INSTITUTE',
    'GENERAL',
    'COMPLAINT',
  ]),
  department: z.string().min(1, 'Department is required'),
  course: z.string().optional(),
  academicClass: z.string().optional(),
  semester: z.string().optional(),
  subject: z.string().optional(),
  teacher: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
  questions: z.array(questionSchema).min(1, 'Form must contain at least 1 question'),
});

export const feedbackResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      questionText: z.string(),
      category: z.string().default('General'),
      type: z.string(),
      value: z.any(),
      numericValue: z.number().optional(),
    })
  ).min(1, 'Must submit at least one answer'),
});

export const attendanceRecordSchema = z.object({
  date: z.string().or(z.date()),
  subject: z.string().min(1, 'Subject is required'),
  academicClass: z.string().min(1, 'Class is required'),
  semester: z.string().min(1, 'Semester is required'),
  records: z.array(
    z.object({
      student: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
      remarks: z.string().optional(),
    })
  ),
});

export const teacherFeedbackSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  semester: z.string().min(1, 'Semester is required'),
  academicPerformance: z.enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT']),
  participation: z.number().min(1).max(5),
  attendancePercentage: z.number().min(0).max(100).optional(),
  strengths: z.string().min(2, 'Strengths remark is required'),
  areasOfImprovement: z.string().min(2, 'Areas of improvement remark is required'),
  remarks: z.string().optional(),
  concerns: z.string().optional(),
});

export const complaintSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Please provide detailed complaint description'),
  category: z.enum(['ACADEMIC', 'INFRASTRUCTURE', 'ADMINISTRATIVE', 'FACULTY', 'HARASSMENT', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  department: z.string().optional(),
  relatedStudent: z.string().optional(),
});

export const complaintUpdateSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  adminResponse: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});
