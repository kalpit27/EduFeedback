import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthUser } from '../types/index.js';
import { User } from '../models/User.js';

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_institute_jwt_key_2026_production';

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: any };
    
    // Fetch full user status
    const userDoc = await User.findById(decoded.id).select('-password');
    if (!userDoc || userDoc.status !== 'ACTIVE') {
      res.status(401).json({ success: false, message: 'User account not found or inactive.' });
      return;
    }

    req.user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      name: userDoc.name,
      departmentId: userDoc.department?.toString(),
      employeeId: userDoc.employeeId,
      studentId: userDoc.studentId,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};
