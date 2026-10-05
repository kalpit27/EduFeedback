import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';
import { AcademicClass } from '../models/AcademicClass.js';
import { Semester } from '../models/Semester.js';
import { StudentProfile } from '../models/StudentProfile.js';

dotenv.config();

/**
 * Usage: npx tsx src/scripts/createUser.ts <name> <email> <password> <role>
 * Example: npx tsx src/scripts/createUser.ts "Kalpit Mhatre" "kalpit@example.com" "Password@123" "ADMIN"
 */
async function createCustomUser() {
  const args = process.argv.slice(2);
  const name = args[0] || 'Kalpit Mhatre';
  const email = (args[1] || 'kalpit@example.com').toLowerCase();
  const password = args[2] || 'Admin@123';
  const role = (args[3] || 'ADMIN').toUpperCase() as 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log(`Connected to MongoDB Atlas. Creating user ${email}...`);

    const existing = await User.findOne({ email });
    if (existing) {
      existing.name = name;
      existing.password = password; // Will be hashed by pre-save hook
      existing.role = role;
      existing.status = 'ACTIVE';
      await existing.save();
      console.log(`✅ User ${email} already existed; updated password to "${password}" and role to "${role}".`);
    } else {
      const dept = await Department.findOne();
      const user = await User.create({
        name,
        email,
        password,
        role,
        department: dept?._id,
        status: 'ACTIVE',
      });

      if (role === 'STUDENT') {
        const course = await Course.findOne();
        const cls = await AcademicClass.findOne();
        const sem = await Semester.findOne();
        await StudentProfile.create({
          user: user._id,
          studentId: 'STU' + Math.floor(100000 + Math.random() * 900000),
          department: dept?._id,
          course: course?._id,
          academicClass: cls?._id,
          semester: sem?._id,
          academicYear: '2025-2026',
          status: 'ACTIVE',
        });
      }

      console.log(`✅ Successfully created new user in MongoDB Atlas:`);
      console.log(`- Name:     ${name}`);
      console.log(`- Email:    ${email}`);
      console.log(`- Password: ${password}`);
      console.log(`- Role:     ${role}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Error creating user in Atlas:', err.message);
    process.exit(1);
  }
}

createCustomUser();
