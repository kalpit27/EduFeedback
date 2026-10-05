import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  durationYears: number;
  totalSemesters: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    durationYears: { type: Number, default: 3 },
    totalSemesters: { type: Number, default: 6 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

CourseSchema.index({ department: 1, code: 1 }, { unique: true });
CourseSchema.index({ department: 1 });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
