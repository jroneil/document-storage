import mongoose from 'mongoose';
import { config } from '../config/config';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await mongoose.connect(config.mongoose.url);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
