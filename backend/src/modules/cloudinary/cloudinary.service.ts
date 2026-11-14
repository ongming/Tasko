import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import type { ICloudinaryService } from './interfaces/cloudinary-service.interface.js';

@Injectable()
export class CloudinaryService implements ICloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL')?.trim();
    if (cloudinaryUrl) {
      process.env.CLOUDINARY_URL = cloudinaryUrl;
      cloudinary.config();
    } else {
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'tasko/avatars',
  ): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Tệp tải lên không hợp lệ.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          fetch_format: 'auto',
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error(
              `Upload to Cloudinary failed: ${error?.message || 'Unknown error'}`,
            );
            return reject(
              new BadRequestException('Tải ảnh lên Cloudinary thất bại.'),
            );
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
