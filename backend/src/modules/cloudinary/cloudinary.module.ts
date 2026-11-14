import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service.js';
import { CLOUDINARY_SERVICE } from './interfaces/cloudinary-service.interface.js';

@Module({
  imports: [ConfigModule],
  providers: [
    CloudinaryService,
    {
      provide: CLOUDINARY_SERVICE,
      useExisting: CloudinaryService,
    },
  ],
  exports: [CloudinaryService, CLOUDINARY_SERVICE],
})
export class CloudinaryModule {}
