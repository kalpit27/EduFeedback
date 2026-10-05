import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  studentId: string;
  rollNumber?: string;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  academicClass: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  academicYear: string;
  parents: mongoose.Types.ObjectId[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    rollNumber: { type: String, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    academicYear: { type: String, required: true, default: '2025-2026' },
    parents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

StudentProfileSchema.index({ department: 1, course: 1, academicClass: 1, semester: 1 });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
