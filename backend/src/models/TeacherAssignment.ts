import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherAssignment extends Document {
  teacher: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  academicClass: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const TeacherAssignmentSchema = new Schema<ITeacherAssignment>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    academicYear: { type: String, required: true, default: '2025-2026' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

TeacherAssignmentSchema.index(
  { teacher: 1, department: 1, course: 1, academicClass: 1, semester: 1, subject: 1, academicYear: 1 },
  { unique: true }
);
TeacherAssignmentSchema.index({ teacher: 1 });
TeacherAssignmentSchema.index({ department: 1 });
TeacherAssignmentSchema.index({ subject: 1 });

export const TeacherAssignment = mongoose.model<ITeacherAssignment>('TeacherAssignment', TeacherAssignmentSchema);
