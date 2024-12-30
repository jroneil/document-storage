import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Zod schema for runtime validation
export const UserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(['admin', 'user']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


// Mongoose interface with additional methods
interface UserModel extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserModel>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    
    const parsed = UserSchema.safeParse(this.toObject());
    if (!parsed.success) {
      return next(new Error('Validation failed: ' + parsed.error.message));
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('User validation failed'));
  }
});


userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<UserModel>('User', userSchema);

// Export validation function for use in controllers
export const validateUser = (data: unknown) => {
  return UserSchema.safeParse(data);
};