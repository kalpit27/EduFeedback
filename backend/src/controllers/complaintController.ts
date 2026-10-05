import { Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';
import { complaintSchema, complaintUpdateSchema } from '../validators/index.js';

export const createComplaint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const validated = complaintSchema.parse(req.body);
    const complaint = await Complaint.create({
      ...validated,
      createdBy: req.user.id,
      department: req.body.department || req.user.departmentId,
    });

    // Notify Admins
    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: 'New Complaint/Concern Filed',
        message: `A new ${validated.priority} priority complaint "${validated.title}" has been registered.`,
        type: 'COMPLAINT_UPDATE',
        link: '/admin/complaints',
      });
    }

    const populated = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email role')
      .populate('department', 'name code');

    res.status(201).json({ success: true, message: 'Complaint registered successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { status, priority, category, department } = req.query;
    const query: any = {};

    // Non-admins only see their own filed complaints
    if (req.user.role !== 'ADMIN') {
      query.createdBy = req.user.id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (department) query.department = department;

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email role employeeId studentId')
      .populate('department', 'name code')
      .populate('relatedStudent', 'name studentId email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
      return;
    }

    const { id } = req.params;
    const validated = complaintUpdateSchema.parse(req.body);

    const updatePayload: any = { ...validated };
    if (validated.status === 'RESOLVED' || validated.status === 'CLOSED') {
      updatePayload.resolvedAt = new Date();
      updatePayload.resolvedBy = req.user.id;
    }

    const complaint = await Complaint.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate('createdBy', 'name email')
      .populate('department', 'name code');

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Notify the user who created the complaint
    await Notification.create({
      recipient: complaint.createdBy,
      title: `Complaint Status: ${complaint.status}`,
      message: `Your complaint "${complaint.title}" has been updated to ${complaint.status}. ${complaint.adminResponse ? `Response: ${complaint.adminResponse}` : ''}`,
      type: 'COMPLAINT_UPDATE',
      link: '/complaints',
    });

    res.json({ success: true, message: 'Complaint updated successfully.', data: complaint });
  } catch (error) {
    next(error);
  }
};
