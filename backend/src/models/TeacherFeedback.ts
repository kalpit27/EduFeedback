import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherFeedback extends Document {
  teacher: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  academicClass: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  academicPerformance: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  participation: number; // 1 to 5
  attendancePercentage?: number;
  strengths: string;
  areasOfImprovement: string;
  remarks?: string;
  concerns?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherFeedbackSchema = new Schema<ITeacherFeedback>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    academicPerformance: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT'],
      default: 'GOOD',
      required: true,
    },
    participation: { type: Number, min: 1, max: 5, default: 4 },
    attendancePercentage: { type: Number, min: 0, max: 100 },
    strengths: { type: String, required: true, trim: true },
    areasOfImprovement: { type: String, required: true, trim: true },
    remarks: { type: String, trim: true },
    concerns: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TeacherFeedbackSchema.index({ student: 1 });
TeacherFeedbackSchema.index({ teacher: 1 });
TeacherFeedbackSchema.index({ department: 1, course: 1, semester: 1 });

export const TeacherFeedback = mongoose.model<ITeacherFeedback>('TeacherFeedback', TeacherFeedbackSchema);
