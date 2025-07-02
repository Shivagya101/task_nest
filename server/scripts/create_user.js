// server/scripts/create_user.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/teamtasks';

const createUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'daikaaya@example.com';
    const password = '123456';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists. Updating password...');
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.isActive = true;
      await existingUser.save();
      console.log('✅ Password updated for:', existingUser.email);
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: 'Daikaaya',
      title: 'Developer',
      role: 'user',
      email,
      password: hashedPassword,
      isAdmin: false,
      isActive: true,
    });

    console.log('✅ User created:', user.email);
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createUser();