import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models/User';
import { ApiResponse } from '../types/api';

export interface AuthRequest extends Request {
  user?: any;
}

const mockAdminUser = {
  _id: 'dev-admin',
  name: 'Development Admin',
  email: 'admin@dev.local',
  role: 'admin'
};

export const auth = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    // Check if auth is disabled in development
    if (config.security.isAuthDisabled) {
      console.warn('⚠️ Authentication is disabled! This should only be used in development.');
      req.user = mockAdminUser;
     next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
       res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
       res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Please authenticate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const adminAuth = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    // Check if auth is disabled in development
    if (config.security.isAuthDisabled) {
       next();
    }

    if (req.user?.role !== 'admin') {
      
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};