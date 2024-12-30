import { z } from 'zod';

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
  error: z.unknown().optional(),
}).refine((data) => {
  if (data.success && !data.data) {
    return false;
  }
  if (!data.success && !data.error) {
    return false;
  }
  return true;
}, {
  message: 'Data or error field is required based on success status',
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;