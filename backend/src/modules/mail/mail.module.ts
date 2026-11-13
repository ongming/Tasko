import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service.js';
import { MAIL_SERVICE } from './interfaces/mail-service.interface.js';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: MAIL_SERVICE,
      useExisting: MailService,
    },
  ],
  exports: [MailService, MAIL_SERVICE],
})
export class MailModule {}
