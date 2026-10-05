import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AuthenticatedRequest } from '../types/index.js';
import { loginSchema } from '../validators/index.js';

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await User.findOne({ email: validated.email.toLowerCase() }).populate('department');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'Your account is deactivated. Contact the administrator.' });
      return;
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'super_secret_institute_jwt_key_2026_production';
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '7d' }
    );

    // If student, attach student profile info
    let profileData: any = null;
    if (user.role === 'STUDENT') {
      profileData = await StudentProfile.findOne({ user: user._id })
        .populate('department')
        .populate('course')
        .populate('academicClass')
        .populate('semester');
    }

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        studentId: user.studentId,
        avatar: user.avatar,
        phone: user.phone,
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password').populate('department');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let profileData: any = null;
    if (user.role === 'STUDENT') {
      profileData = await StudentProfile.findOne({ user: user._id })
        .populate('department')
        .populate('course')
        .populate('academicClass')
        .populate('semester')
        .populate('parents', 'name email phone');
    } else if (user.role === 'PARENT') {
      // Find linked students
      const linkedStudentProfiles = await StudentProfile.find({
        $or: [{ parents: user._id }, { user: { $in: user.linkedStudents || [] } }],
      })
        .populate('user', 'name email avatar studentId')
        .populate('department')
        .populate('course')
        .populate('academicClass')
        .populate('semester');
      profileData = { linkedStudents: linkedStudentProfiles };
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        studentId: user.studentId,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, phone, avatar, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (password && password.length >= 6) {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, department, studentId, employeeId, phone, avatar } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const userRole = (role || 'STUDENT').toUpperCase();
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      department: department || undefined,
      studentId: studentId ? studentId.toUpperCase() : (userRole === 'STUDENT' ? 'STU' + Math.floor(100000 + Math.random() * 900000) : undefined),
      employeeId: employeeId ? employeeId.toUpperCase() : (userRole === 'TEACHER' ? 'EMP' + Math.floor(1000 + Math.random() * 9000) : undefined),
      phone,
      avatar: avatar || undefined,
      status: 'ACTIVE',
    });

    let profileData: any = null;
    if (userRole === 'STUDENT') {
      // Find a default course/class/semester in department or system
      const { Department } = await import('../models/Department.js');
      const { Course } = await import('../models/Course.js');
      const { AcademicClass } = await import('../models/AcademicClass.js');
      const { Semester } = await import('../models/Semester.js');

      const dept = department ? await Department.findById(department) : await Department.findOne();
      const course = dept ? await Course.findOne({ department: dept._id }) : await Course.findOne();
      const cls = course ? await AcademicClass.findOne({ course: course._id }) : await AcademicClass.findOne();
      const sem = cls ? await Semester.findOne({ academicClass: cls._id }) : await Semester.findOne();

      if (dept && course && cls && sem) {
        profileData = await StudentProfile.create({
          user: newUser._id,
          studentId: newUser.studentId || 'STU001',
          department: dept._id,
          course: course._id,
          academicClass: cls._id,
          semester: sem._id,
          academicYear: '2025-2026',
          status: 'ACTIVE',
        });
      }
    }

    const secret = process.env.JWT_SECRET || 'super_secret_institute_jwt_key_2026_production';
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        studentId: newUser.studentId,
        employeeId: newUser.employeeId,
        avatar: newUser.avatar,
        phone: newUser.phone,
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

