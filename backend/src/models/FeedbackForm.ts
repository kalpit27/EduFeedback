import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  description?: string;
  type:
    | 'STAR_RATING'
    | 'MULTIPLE_CHOICE'
    | 'CHECKBOX'
    | 'DROPDOWN'
    | 'YES_NO'
    | 'TEXT'
    | 'LONG_TEXT'
    | 'RATING_SCALE'
    | 'NUMBER_RATING';
  options?: string[];
  required: boolean;
  category: string;
  order: number;
  min?: number;
  max?: number;
}

export interface IFeedbackForm extends Document {
  title: string;
  description?: string;
  instructions?: string;
  formType:
    | 'STUDENT_TO_TEACHER'
    | 'TEACHER_TO_STUDENT'
    | 'PARENT_TO_INSTITUTE'
    | 'GENERAL'
    | 'COMPLAINT';
  department: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  academicClass?: mongoose.Types.ObjectId;
  semester?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  teacher?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: [
        'STAR_RATING',
        'MULTIPLE_CHOICE',
        'CHECKBOX',
        'DROPDOWN',
        'YES_NO',
        'TEXT',
        'LONG_TEXT',
        'RATING_SCALE',
        'NUMBER_RATING',
      ],
      required: true,
      default: 'STAR_RATING',
    },
    options: [{ type: String, trim: true }],
    required: { type: Boolean, default: true },
    category: { type: String, default: 'General', trim: true },
    order: { type: Number, default: 0 },
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
  },
  { _id: false }
);

const FeedbackFormSchema = new Schema<IFeedbackForm>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    instructions: { type: String, trim: true },
    formType: {
      type: String,
      enum: [
        'STUDENT_TO_TEACHER',
        'TEACHER_TO_STUDENT',
        'PARENT_TO_INSTITUTE',
        'GENERAL',
        'COMPLAINT',
      ],
      required: true,
      default: 'STUDENT_TO_TEACHER',
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass' },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'],
      default: 'DRAFT',
    },
    questions: [QuestionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

FeedbackFormSchema.index({ department: 1, course: 1, academicClass: 1, semester: 1, status: 1 });
FeedbackFormSchema.index({ teacher: 1, status: 1 });
FeedbackFormSchema.index({ formType: 1, status: 1 });

export const FeedbackForm = mongoose.model<IFeedbackForm>('FeedbackForm', FeedbackFormSchema);
