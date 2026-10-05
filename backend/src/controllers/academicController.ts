import { Response, NextFunction } from 'express';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';
import { AcademicClass } from '../models/AcademicClass.js';
import { Semester } from '../models/Semester.js';
import { Subject } from '../models/Subject.js';
import { TeacherAssignment } from '../models/TeacherAssignment.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  departmentSchema,
  courseSchema,
  academicClassSchema,
  semesterSchema,
  subjectSchema,
  teacherAssignmentSchema,
} from '../validators/index.js';

// --- DEPARTMENTS ---
export const getDepartments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { code: { $regex: search as string, $options: 'i' } },
      ];
    }
    const departments = await Department.find(query).sort({ name: 1 });
    res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = departmentSchema.parse(req.body);
    const department = await Department.create(validated);
    res.status(201).json({ success: true, message: 'Department created successfully.', data: department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }
    res.json({ success: true, message: 'Department updated successfully.', data: department });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// --- COURSES ---
export const getCourses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, status } = req.query;
    const query: any = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const courses = await Course.find(query).populate('department', 'name code').sort({ name: 1 });
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = courseSchema.parse(req.body);
    const course = await Course.create(validated);
    const populated = await course.populate('department', 'name code');
    res.status(201).json({ success: true, message: 'Course created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(id, req.body, { new: true }).populate('department', 'name code');
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }
    res.json({ success: true, message: 'Course updated successfully.', data: course });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// --- CLASSES ---
export const getClasses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, course, status } = req.query;
    const query: any = {};
    if (department) query.department = department;
    if (course) query.course = course;
    if (status) query.status = status;

    const classes = await AcademicClass.find(query)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .sort({ name: 1 });
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = academicClassSchema.parse(req.body);
    const academicClass = await AcademicClass.create(validated);
    const populated = await academicClass.populate(['department', 'course']);
    res.status(201).json({ success: true, message: 'Class created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

// --- SEMESTERS ---
export const getSemesters = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, course, academicClass, status } = req.query;
    const query: any = {};
    if (department) query.department = department;
    if (course) query.course = course;
    if (academicClass) query.academicClass = academicClass;
    if (status) query.status = status;

    const semesters = await Semester.find(query)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .sort({ semesterNumber: 1 });
    res.json({ success: true, count: semesters.length, data: semesters });
  } catch (error) {
    next(error);
  }
};

export const createSemester = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = semesterSchema.parse(req.body);
    const semester = await Semester.create(validated);
    const populated = await semester.populate(['department', 'course', 'academicClass']);
    res.status(201).json({ success: true, message: 'Semester created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

// --- SUBJECTS ---
export const getSubjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, course, academicClass, semester, status } = req.query;
    const query: any = {};
    if (department) query.department = department;
    if (course) query.course = course;
    if (academicClass) query.academicClass = academicClass;
    if (semester) query.semester = semester;
    if (status) query.status = status;

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .sort({ name: 1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = subjectSchema.parse(req.body);
    const subject = await Subject.create(validated);
    const populated = await subject.populate(['department', 'course', 'academicClass', 'semester']);
    res.status(201).json({ success: true, message: 'Subject created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

// --- TEACHER ASSIGNMENTS ---
export const getTeacherAssignments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teacher, department, course, semester, status } = req.query;
    const query: any = {};
    if (teacher) query.teacher = teacher;
    if (department) query.department = department;
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (status) query.status = status;

    const assignments = await TeacherAssignment.find(query)
      .populate('teacher', 'name email employeeId avatar')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name code credits')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const createTeacherAssignment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = teacherAssignmentSchema.parse(req.body);
    const assignment = await TeacherAssignment.create(validated);
    const populated = await assignment.populate([
      'teacher',
      'department',
      'course',
      'academicClass',
      'semester',
      'subject',
    ]);
    res.status(201).json({ success: true, message: 'Teacher assigned successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacherAssignment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await TeacherAssignment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Teacher assignment removed successfully.' });
  } catch (error) {
    next(error);
  }
};
