import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type:
    | 'FEEDBACK_AVAILABLE'
    | 'FEEDBACK_SUBMITTED'
    | 'ATTENDANCE_UPDATED'
    | 'TEACHER_FEEDBACK'
    | 'COMPLAINT_UPDATE'
    | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'FEEDBACK_AVAILABLE',
        'FEEDBACK_SUBMITTED',
        'ATTENDANCE_UPDATED',
        'TEACHER_FEEDBACK',
        'COMPLAINT_UPDATE',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
