import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    const users = await User.find({}, 'name email role status createdAt');
    console.log('--- REGISTERED USERS IN MONGODB ATLAS ---');
    users.forEach((u) => {
      console.log(`- Role: [${u.role.padEnd(7)}] | Email: ${u.email.padEnd(32)} | Name: ${u.name}`);
    });
    console.log('-----------------------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to Atlas:', err);
  }
}

checkUsers();
