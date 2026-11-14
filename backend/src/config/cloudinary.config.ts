import { registerAs } from '@nestjs/config';

export const cloudinaryConfig = registerAs('cloudinary', () => ({
  cloudinaryUrl: process.env.CLOUDINARY_URL || '',
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
}));
