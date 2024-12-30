import { Schema, model, Document as MongoDocument, Types } from 'mongoose';
import { z } from 'zod';

// Zod schema for runtime validation
export const DocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileType: z.enum(['excel', 'pdf', 'csv', 'html', 'video', 'zip']),
  fileSize: z.number().positive("File size must be positive"),
  s3Key: z.string().min(1, "S3 key is required"),
  metadata: z.record(z.string()),
  // Skip validating 'uploadedBy' here, as Mongoose will handle it.
  isPublic: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// TypeScript type derived from Zod schema
export type IDocument = z.infer<typeof DocumentSchema> & {
  uploadedBy: Types.ObjectId; // Override uploadedBy to be ObjectId in TypeScript type
};

// Mongoose interface extending the Zod-derived type
interface DocumentModel extends IDocument, MongoDocument {}

const documentSchema = new Schema<DocumentModel>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['excel', 'pdf', 'csv', 'html', 'video', 'zip']
  },
  fileSize: {
    type: Number,
    required: true
  },
  s3Key: {
    type: String,
    required: true,
    unique: true
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  uploadedBy: {
    type: Schema.Types.ObjectId, // Mongoose handles this
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Text search index
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Middleware to validate document before saving
documentSchema.pre('save', async function(next) {
  try {
    // Convert ObjectId to string before passing to Zod (Zod still validates other fields)
    DocumentSchema.parse({
      ...this.toObject(),
      uploadedBy: this.uploadedBy.toString() // Ensure it's a string before validation
    });
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('Document validation failed'));
  }
});

export const Document = model<DocumentModel>('Document', documentSchema);

// Export validation function for use in controllers
export const validateDocument = (data: unknown) => {
  return DocumentSchema.safeParse(data);
};
