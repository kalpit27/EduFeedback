import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  academicClass: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  credits?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    credits: { type: Number, default: 4 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

SubjectSchema.index({ department: 1, course: 1, semester: 1, code: 1 }, { unique: true });
SubjectSchema.index({ department: 1 });
SubjectSchema.index({ semester: 1 });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
