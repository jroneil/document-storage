import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/config';
import { ApiResponse } from '../types/api';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const RegisterSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6)
});

export const authController = {
  async register1(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    res.status(200).json({ success: true, message: 'Registered successfully' });
  },

  async register(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const validation = RegisterSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid input',
          error: validation.error,
        });
        return; // Prevent further execution
      }
  
      const { email, password, name } = validation.data;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User already exists',
        });
        return; // Prevent further execution
      }
  
      const user = await User.create({ email, password, name });
  
      const token = jwt.sign({ id: user._id }, config.jwt.secret, {
        expiresIn: '7d',
      });
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
  


      async login(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
        try {
          const validation = LoginSchema.safeParse(req.body);
          if (!validation.success) {
              res.status(400).json({
              success: false,
              message: 'Invalid input',
              error: validation.error,
            });
            return; // Prevent further execution
          }
    
          const { email, password } = validation.data;
    
          const user = await User.findOne({ email });
          if (!user) {
              res.status(401).json({
              success: false,
              message: 'Invalid credentials',
            });
            return; // Prevent further execution
          }
    
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
              res.status(401).json({
              success: false,
              message: 'Invalid credentials',
            });
            return; // Prevent further execution
          }
    
          const token = jwt.sign({ id: user._id }, config.jwt.secret, {
            expiresIn: '7d',
          });
    
            res.json({
            success: true,
            message: 'Login successful',
            data: {
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              },
            },
          });
          return; // Prevent further execution
        } catch (error) {
            res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return; // Prevent further execution
        }
      },
};
