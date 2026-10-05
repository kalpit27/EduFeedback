import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/institute_feedback';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${(error as Error).message}`);
    console.warn(`[Database] Please ensure MongoDB is running or MONGODB_URI in backend/.env points to a valid MongoDB Atlas connection string.`);
  }
};
