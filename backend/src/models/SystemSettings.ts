import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  instituteName: string;
  instituteCode: string;
  academicYear: string;
  contactEmail: string;
  contactPhone?: string;
  allowLateSubmissions: boolean;
  enableEmailNotifications: boolean;
  themePrimaryColor: string;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    instituteName: { type: String, required: true, default: 'Apex Institute of Higher Learning' },
    instituteCode: { type: String, default: 'AIHL' },
    academicYear: { type: String, default: '2025-2026' },
    contactEmail: { type: String, default: 'admin@apexinstitute.edu' },
    contactPhone: { type: String, default: '+1 (555) 234-5678' },
    allowLateSubmissions: { type: Boolean, default: false },
    enableEmailNotifications: { type: Boolean, default: true },
    themePrimaryColor: { type: String, default: '#1DCED8' },
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
