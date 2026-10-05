import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedbackAnswer {
  questionId: string;
  questionText: string;
  category: string;
  type: string;
  value: any; // string, number, string[]
  numericValue?: number; // for star/number/rating scale calculations
}

export interface IFeedbackResponse extends Document {
  form: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId; // Protected & confidential
  teacher?: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  academicClass?: mongoose.Types.ObjectId;
  semester?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  answers: IFeedbackAnswer[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackAnswerSchema = new Schema<IFeedbackAnswer>(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    category: { type: String, default: 'General' },
    type: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    numericValue: { type: Number },
  },
  { _id: false }
);

const FeedbackResponseSchema = new Schema<IFeedbackResponse>(
  {
    form: { type: Schema.Types.ObjectId, ref: 'FeedbackForm', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    academicClass: { type: Schema.Types.ObjectId, ref: 'AcademicClass' },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    answers: [FeedbackAnswerSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One submission per student per form
FeedbackResponseSchema.index({ student: 1, form: 1 }, { unique: true });
FeedbackResponseSchema.index({ form: 1 });
FeedbackResponseSchema.index({ teacher: 1 });
FeedbackResponseSchema.index({ department: 1, course: 1, semester: 1 });

export const FeedbackResponse = mongoose.model<IFeedbackResponse>('FeedbackResponse', FeedbackResponseSchema);
