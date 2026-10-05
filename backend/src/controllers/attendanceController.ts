import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../types/index.js';
import { attendanceRecordSchema } from '../validators/index.js';

// Record or update attendance for a subject session
export const recordAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ success: false, message: 'Forbidden: Only teachers or admins can record attendance.' });
      return;
    }

    const { date, subject, academicClass, semester, records, department, course } = req.body;
    attendanceRecordSchema.parse(req.body);

    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      date: sessionDate,
      subject,
      academicClass,
    });

    let attendanceDoc;
    if (existing) {
      existing.records = records;
      existing.teacher = new mongoose.Types.ObjectId(req.user.id);
      await existing.save();
      attendanceDoc = existing;
    } else {
      attendanceDoc = await Attendance.create({
        date: sessionDate,
        subject,
        teacher: req.user.id,
        department,
        course,
        academicClass,
        semester,
        records,
      });
    }

    // Trigger parent/student notifications for absent students
    const absentStudentIds = records
      .filter((r: any) => r.status === 'ABSENT')
      .map((r: any) => r.student);

    if (absentStudentIds.length > 0) {
      const absentProfiles = await StudentProfile.find({ user: { $in: absentStudentIds } });
      for (const prof of absentProfiles) {
        // notify student
        await Notification.create({
          recipient: prof.user,
          title: 'Attendance Notice',
          message: `You were marked absent for attendance on ${sessionDate.toLocaleDateString()}.`,
          type: 'ATTENDANCE_UPDATED',
          link: '/student/attendance',
        });

        // notify linked parents
        for (const pId of prof.parents) {
          await Notification.create({
            recipient: pId,
            title: 'Child Attendance Alert',
            message: `Attendance updated: Student was marked absent on ${sessionDate.toLocaleDateString()}.`,
            type: 'ATTENDANCE_UPDATED',
            link: '/parent/attendance',
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: attendanceDoc,
    });
  } catch (error) {
    next(error);
  }
};

// Get Attendance records with filters
export const getAttendance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { department, course, academicClass, semester, subject, date, studentId } = req.query;
    const query: any = {};

    if (department) query.department = department;
    if (course) query.course = course;
    if (academicClass) query.academicClass = academicClass;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;
    if (date) {
      const d = new Date(date as string);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }

    const attendanceList = await Attendance.find(query)
      .populate('subject', 'name code')
      .populate('teacher', 'name employeeId')
      .populate('academicClass', 'name division')
      .populate('semester', 'name semesterNumber')
      .populate('records.student', 'name studentId email')
      .sort({ date: -1 });

    res.json({ success: true, count: attendanceList.length, data: attendanceList });
  } catch (error) {
    next(error);
  }
};

// Get single student's attendance summary & breakdown
export const getStudentAttendanceSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetStudentId = req.params.studentId || req.user?.id;
    if (!targetStudentId) {
      res.status(400).json({ success: false, message: 'Student ID required.' });
      return;
    }

    const studentObjectId = new mongoose.Types.ObjectId(targetStudentId);

    const attendances = await Attendance.find({
      'records.student': studentObjectId,
    })
      .populate('subject', 'name code credits')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    let totalSessions = attendances.length;
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    const subjectMap = new Map<string, { name: string; code: string; total: number; present: number }>();
    const sessionHistory: any[] = [];

    attendances.forEach((att) => {
      const rec = att.records.find((r) => r.student.toString() === targetStudentId.toString());
      if (rec) {
        if (rec.status === 'PRESENT') presentCount++;
        else if (rec.status === 'LATE') {
          lateCount++;
          presentCount += 0.5; // half credit
        } else absentCount++;

        const subj: any = att.subject;
        const subjId = subj?._id?.toString() || 'unknown';
        if (!subjectMap.has(subjId)) {
          subjectMap.set(subjId, {
            name: subj?.name || 'Subject',
            code: subj?.code || '',
            total: 0,
            present: 0,
          });
        }
        const sEntry = subjectMap.get(subjId)!;
        sEntry.total++;
        if (rec.status === 'PRESENT') sEntry.present++;
        else if (rec.status === 'LATE') sEntry.present += 0.5;

        sessionHistory.push({
          id: att._id,
          date: att.date,
          subject: subj?.name,
          subjectCode: subj?.code,
          teacher: (att.teacher as any)?.name,
          status: rec.status,
          remarks: rec.remarks,
        });
      }
    });

    const overallPercentage =
      totalSessions > 0 ? Number(((presentCount / totalSessions) * 100).toFixed(1)) : 100;

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([id, data]) => ({
      subjectId: id,
      subjectName: data.name,
      subjectCode: data.code,
      totalClasses: data.total,
      attendedClasses: data.present,
      percentage: data.total > 0 ? Number(((data.present / data.total) * 100).toFixed(1)) : 100,
    }));

    res.json({
      success: true,
      data: {
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        overallPercentage,
        subjectBreakdown,
        sessionHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};
