import { Request, Response } from 'express';
import { MetadataField, MetadataFieldSchema } from '../models/MetadataField';
import { ApiResponse } from '../types/api';

export const metadataController = {
  async createField(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const validation = MetadataFieldSchema.safeParse(req.body);
      if (!validation.success) {
          res.status(400).json({
          success: false,
          message: 'Invalid input',
          error: validation.error,
        });
        return; // Prevent further execution
      }

      const field = await MetadataField.create(validation.data);
      res.status(201).json({
        success: true,
        message: 'Metadata field created successfully',
        data: field,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating metadata field',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getFields(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const fields = await MetadataField.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        message: 'Metadata fields retrieved successfully',
        data: fields,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving metadata fields',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async updateField(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const validation = MetadataFieldSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid input',
          error: validation.error,
        });
        return; // Prevent further execution
      }

      const field = await MetadataField.findByIdAndUpdate(
        req.params.id,
        validation.data,
        { new: true }
      );

      if (!field) {
         res.status(404).json({
          success: false,
          message: 'Metadata field not found',
        });
        return; // Prevent further execution
      }

      res.json({
        success: true,
        message: 'Metadata field updated successfully',
        data: field,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating metadata field',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async deleteField(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const field = await MetadataField.findByIdAndDelete(req.params.id);

      if (!field) {
        res.status(404).json({
          success: false,
          message: 'Metadata field not found',
        });
        return; // Prevent further execution
      }

      res.json({
        success: true,
        message: 'Metadata field deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting metadata field',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};