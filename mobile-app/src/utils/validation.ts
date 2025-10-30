import { z } from 'zod';
import { IMAGE_UPLOAD } from '@constants';

// Phone number validation (Indian format)
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
  .length(10, 'Phone number must be 10 digits');

// OTP validation
export const otpSchema = z
  .string()
  .regex(/^\d{4,6}$/, 'Invalid OTP')
  .length(4, 'OTP must be 4 digits');

// Article submission schema
export const articleSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  summary: z
    .string()
    .max(300, 'Summary must be less than 300 characters')
    .optional(),
  content: z
    .string()
    .min(100, 'Content must be at least 100 characters')
    .max(10000, 'Content is too long'),
  categoryId: z.number().positive('Please select a category'),
  districtId: z.number().positive('Please select a district'),
  source: z.string().max(200).optional(),
  imageIds: z.array(z.number()).max(IMAGE_UPLOAD.MAX_IMAGES).optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

// Ad submission schema
export const adSchema = z.object({
  name: z
    .string()
    .min(3, 'Ad name must be at least 3 characters')
    .max(100, 'Ad name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  targetUrl: z.string().url('Invalid URL'),
  categoryIds: z
    .array(z.number().positive())
    .min(1, 'Select at least one category')
    .max(5, 'Maximum 5 categories'),
  districtIds: z
    .array(z.number().positive())
    .min(1, 'Select at least one district')
    .max(10, 'Maximum 10 districts'),
  budget: z.number().positive('Budget must be greater than 0'),
  startDate: z.date(),
  endDate: z.date(),
  creative: z.string().optional(),
});

export type AdFormData = z.infer<typeof adSchema>;

// Profile update schema
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional(),
});

// Validate image file
export const validateImageFile = (file: {
  uri: string;
  type?: string;
  size?: number;
}): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type && !IMAGE_UPLOAD.ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
    };
  }

  // Check file size
  if (file.size && file.size > IMAGE_UPLOAD.MAX_SIZE) {
    const maxSizeMB = IMAGE_UPLOAD.MAX_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
};

// Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
