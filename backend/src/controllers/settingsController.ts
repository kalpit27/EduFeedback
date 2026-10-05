import { Response, NextFunction } from 'express';
import { SystemSettings } from '../models/SystemSettings.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getSystemSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        instituteName: 'Apex Institute of Higher Learning',
        instituteCode: 'AIHL',
        academicYear: '2025-2026',
        contactEmail: 'admin@apexinstitute.edu',
        contactPhone: '+1 (555) 234-5678',
        allowLateSubmissions: false,
        enableEmailNotifications: true,
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
      return;
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json({ success: true, message: 'System settings updated.', data: settings });
  } catch (error) {
    next(error);
  }
};
