import mongoose from 'mongoose';
import { config } from '../config/config';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Connecting to MongoDB:', config.mongoose.url); // Log the connection string
    await mongoose.connect(config.mongoose.url);
    console.log('Connected to MongoDB successfully.');

    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      },
      { upsert: true, new: true, runValidators: true } // Added runValidators
    );

    console.log('findOneAndUpdate result:', result); // Log the result of findOneAndUpdate

    if (result) {
      console.log('Admin user created/updated successfully.');
      console.log('Email: admin@example.com');
      // DO NOT LOG THE HASHED PASSWORD IN PRODUCTION
      // console.log('Hashed Password:', hashedPassword); // Only for debugging
    } else {
      console.log('Admin user not created/updated.');
    }
  } catch (error) {
    console.error('Error seeding database:', error); // Log the full error object
  } finally {
    if (mongoose.connection.readyState === 1) { // Check if connected before disconnecting
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB.');
    }
  }
}

seed();