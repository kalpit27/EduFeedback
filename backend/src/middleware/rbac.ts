import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized access. Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRoles('ADMIN');
export const requireTeacher = requireRoles('ADMIN', 'TEACHER');
export const requireStudent = requireRoles('ADMIN', 'STUDENT');
export const requireParent = requireRoles('ADMIN', 'PARENT');
