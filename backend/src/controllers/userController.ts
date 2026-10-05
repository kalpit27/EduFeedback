import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AuthenticatedRequest } from '../types/index.js';
import { createUserSchema } from '../validators/index.js';

// --- TEACHERS ---
export const getTeachers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, search, status } = req.query;
    const query: any = { role: 'TEACHER' };
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { employeeId: { $regex: search as string, $options: 'i' } },
      ];
    }

    const teachers = await User.find(query).select('-password').populate('department', 'name code').sort({ name: 1 });
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = createUserSchema.parse({ ...req.body, role: 'TEACHER' });
    const teacher = await User.create({
      ...validated,
      password: validated.password || 'Teacher@123',
    });

    const populated = await User.findById(teacher._id).select('-password').populate('department');
    res.status(201).json({ success: true, message: 'Teacher created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

// --- STUDENTS ---
export const getStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, course, academicClass, semester, search, status } = req.query;

    const profileQuery: any = {};
    if (department) profileQuery.department = department;
    if (course) profileQuery.course = course;
    if (academicClass) profileQuery.academicClass = academicClass;
    if (semester) profileQuery.semester = semester;
    if (status) profileQuery.status = status;

    const profiles = await StudentProfile.find(profileQuery)
      .populate({
        path: 'user',
        select: '-password',
        match: search
          ? {
              $or: [
                { name: { $regex: search as string, $options: 'i' } },
                { email: { $regex: search as string, $options: 'i' } },
                { studentId: { $regex: search as string, $options: 'i' } },
              ],
            }
          : {},
      })
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('parents', 'name email phone');

    // Filter out null users (due to search query mismatch)
    const validStudents = profiles.filter((p) => p.user !== null);

    res.json({ success: true, count: validStudents.length, data: validStudents });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, studentId, rollNumber, department, course, academicClass, semester, academicYear, phone, parents } = req.body;

    const user = await User.create({
      name,
      email,
      password: req.body.password || 'Student@123',
      role: 'STUDENT',
      studentId: studentId.toUpperCase(),
      phone,
      department,
      status: 'ACTIVE',
    });

    const profile = await StudentProfile.create({
      user: user._id,
      studentId: studentId.toUpperCase(),
      rollNumber,
      department,
      course,
      academicClass,
      semester,
      academicYear: academicYear || '2025-2026',
      parents: parents || [],
      status: 'ACTIVE',
    });

    const populated = await StudentProfile.findById(profile._id)
      .populate('user', '-password')
      .populate('department')
      .populate('course')
      .populate('academicClass')
      .populate('semester');

    res.status(201).json({ success: true, message: 'Student registered successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

// --- PARENTS ---
export const getParents = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status } = req.query;
    const query: any = { role: 'PARENT' };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { phone: { $regex: search as string, $options: 'i' } },
      ];
    }

    const parents = await User.find(query).select('-password').populate('linkedStudents', 'name email studentId').sort({ name: 1 });
    res.json({ success: true, count: parents.length, data: parents });
  } catch (error) {
    next(error);
  }
};

export const createParent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, linkedStudents, password } = req.body;
    const parent = await User.create({
      name,
      email,
      phone,
      password: password || 'Parent@123',
      role: 'PARENT',
      linkedStudents: linkedStudents || [],
      status: 'ACTIVE',
    });

    // Link parent in student profiles
    if (linkedStudents && linkedStudents.length > 0) {
      await StudentProfile.updateMany(
        { user: { $in: linkedStudents } },
        { $addToSet: { parents: parent._id } }
      );
    }

    res.status(201).json({ success: true, message: 'Parent created successfully.', data: parent });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({ success: true, message: `User status changed to ${status}.`, data: user });
  } catch (error) {
    next(error);
  }
};
