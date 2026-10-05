import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicClass extends Document {
  name: string; // FY, SY, TY
  division?: string; // A, B, etc.
  course: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  academicYear: string; // e.g. 2025-2026
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const AcademicClassSchema = new Schema<IAcademicClass>(
  {
    name: { type: String, required: true, trim: true },
    division: { type: String, trim: true, default: 'A' },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    academicYear: { type: String, required: true, default: '2025-2026' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

AcademicClassSchema.index({ department: 1, course: 1, name: 1, division: 1, academicYear: 1 }, { unique: true });
AcademicClassSchema.index({ department: 1 });
AcademicClassSchema.index({ course: 1 });

export const AcademicClass = mongoose.model<IAcademicClass>('AcademicClass', AcademicClassSchema);
