import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: 'ACADEMIC' | 'INFRASTRUCTURE' | 'ADMINISTRATIVE' | 'FACULTY' | 'HARASSMENT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdBy: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  relatedStudent?: mongoose.Types.ObjectId;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['ACADEMIC', 'INFRASTRUCTURE', 'ADMINISTRATIVE', 'FACULTY', 'HARASSMENT', 'OTHER'],
      default: 'ACADEMIC',
      required: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    relatedStudent: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    adminResponse: { type: String, trim: true },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ComplaintSchema.index({ createdBy: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ department: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
