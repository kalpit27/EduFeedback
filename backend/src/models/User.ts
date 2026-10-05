import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  department?: mongoose.Types.ObjectId;
  employeeId?: string;
  studentId?: string;
  linkedStudents?: mongoose.Types.ObjectId[]; // For parents
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      required: true,
      default: 'STUDENT',
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    employeeId: { type: String, trim: true },
    studentId: { type: String, trim: true },
    linkedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ employeeId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
