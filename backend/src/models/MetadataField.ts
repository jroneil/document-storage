import { Schema, model, Document } from "mongoose";
import { z } from "zod";

export const MetadataFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "number", "date", "select", "boolean"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For select type fields
  defaultValue: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type IMetadataField = z.infer<typeof MetadataFieldSchema>;

interface MetadataFieldModel extends IMetadataField, Document {}

const metadataFieldSchema = new Schema<MetadataFieldModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["text", "number", "date", "select", "boolean"],
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    defaultValue: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MetadataField = model<MetadataFieldModel>(
  "MetadataField",
  metadataFieldSchema
);
