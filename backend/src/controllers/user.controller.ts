import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiResponse } from '../types/api';
import { z } from 'zod';
import { AuthRequest } from '@/middleware/auth';

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional(),
});

export const userController = {
  async getUsers(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async updateUser(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const validation = UpdateUserSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid input',
          error: validation.error,
        });
        return;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { ...validation.data },
        { new: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async deleteUser(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getCurrentUser(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user.id; // Assuming the user ID is stored in req.user after authentication
      const user = await User.findById(userId).select('-password');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};