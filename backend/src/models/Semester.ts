import mongoose, { Document, Schema } from 'mongoose';

export interface ISemester extends Document {
  name: string; // e.g., 'Semester I', 'Semester III'
  semesterNumber: number; // 1, 2, 3, etc.
  course: mongoose.Types.ObjectId;
  academicClass: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    name: { type: String, required: true, trim: true },
    semesterNumber: { type: Number, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    academicYear: { type: String, required: true, default: '2025-2026' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

SemesterSchema.index({ department: 1, course: 1, academicClass: 1, semesterNumber: 1, academicYear: 1 }, { unique: true });
SemesterSchema.index({ department: 1 });
SemesterSchema.index({ course: 1 });
SemesterSchema.index({ academicClass: 1 });

export const Semester = mongoose.model<ISemester>('Semester', SemesterSchema);
