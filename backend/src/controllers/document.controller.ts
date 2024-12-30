import { Request, Response } from "express";
import { Document, validateDocument } from "../models/Document";
import { s3Service } from "../services/s3Service";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../types/api";
import { z } from "zod";

// Query validation schema
const QuerySchema = z.object({
  page: z.string().optional().transform(Number).default("1"),
  limit: z.string().optional().transform(Number).default("10"),
  search: z.string().optional(),
  fileType: z.string().optional(),
  isPublic: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export const documentController = {
  // Upload document
  async uploadDocument(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file provided",
        });
        return; // Prevent further execution
      }

      const { title, description, isPublic, tags, metadata } = req.body;
      const fileType = req.file.originalname.split(".").pop()?.toLowerCase();

      if (!["excel", "pdf", "csv", "html", "zip"].includes(fileType || "")) {
        res.status(400).json({
          success: false,
          message: "Invalid file type",
        });
        return; // Prevent further execution
      }

      // Generate unique S3 key
      const s3Key = `${Date.now()}-${req.file.originalname}`;

      // Upload to S3
      const s3Upload = await s3Service.uploadFile(req.file, s3Key);

      if (!req.user) {
        await s3Service.deleteFile(s3Key); // Cleanup S3
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return; // Prevent further execution
      }

      // Create document record
      const documentData = {
        title,
        description,
        fileType,
        fileSize: req.file.size,
        s3Key,
        metadata: metadata ? JSON.parse(metadata) : {},
        uploadedBy: req.user._id,
        isPublic: isPublic === "true",
        tags: tags ? JSON.parse(tags) : [],
      };

      const validationResult = validateDocument(documentData);
      if (!validationResult.success) {
        await s3Service.deleteFile(s3Key); // Cleanup S3
        res.status(400).json({
          success: false,
          message: "Invalid document data",
          error: validationResult.error,
        });
        return; // Prevent further execution
      }

      const document = await Document.create(documentData);

      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: document,
      });
      return; // Prevent further execution
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error uploading document",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return; // Prevent further execution
    }
  },

  // Get all documents (with pagination and filters)
  async getDocuments(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const queryValidation = QuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          error: queryValidation.error,
        });
        return; // Prevent further execution
      }

      const { page, limit, search, fileType, isPublic } = queryValidation.data;

      const query: any = {};

      // Build query based on filters
      if (fileType) query.fileType = fileType;
      if (typeof isPublic === "boolean") query.isPublic = isPublic;
      if (req.user && req.user.role !== "admin") {
        query.$or = [{ isPublic: true }, { uploadedBy: req.user._id }];
      }
      if (search) {
        query.$text = { $search: search };
      }

      const total = await Document.countDocuments(query);
      const documents = await Document.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("uploadedBy", "name email");

      res.json({
        success: true,
        message: "Documents retrieved successfully",
        data: {
          documents,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving documents",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get document by ID
  async getDocument(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const document = await Document.findById(req.params.id).populate(
        "uploadedBy",
        "name email"
      );

      if (!document) {
        res.status(404).json({
          success: false,
          message: "Document not found",
        });
        return; // Prevent further execution
      }

      // Check access permissions
      if (
        !document.isPublic &&
        document.uploadedBy._id.toString() !== req.user?._id.toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return; // Prevent further execution
      }

      // Generate signed URL for download
      const signedUrl = s3Service.getSignedUrl(document.s3Key);

      res.json({
        success: true,
        message: "Document retrieved successfully",
        data: { ...document.toObject(), downloadUrl: signedUrl },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving document",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete document
  async deleteDocument(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        res.status(404).json({
          success: false,
          message: "Document not found",
        });
        return; // Prevent further execution
      }

      // Check delete permissions
      if (
        document.uploadedBy.toString() !== req.user?._id.toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return; // Prevent further execution
      }

      // Delete from S3
      await s3Service.deleteFile(document.s3Key);

      // Delete from database
      await document.deleteOne();

      res.json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting document",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
