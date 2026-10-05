import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceRecord {
  student: mongoose.Types.ObjectId;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
}

export interface IAttendance extends Document {
  date: Date;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  academicClass: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  records: IAttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], default: 'PRESENT', required: true },
    remarks: { type: String, trim: true },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: { type: Date, required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    records: [AttendanceRecordSchema],
  },
  { timestamps: true }
);

AttendanceSchema.index({ date: 1, subject: 1, academicClass: 1 }, { unique: true });
AttendanceSchema.index({ department: 1, course: 1, semester: 1 });
AttendanceSchema.index({ teacher: 1 });
AttendanceSchema.index({ 'records.student': 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
