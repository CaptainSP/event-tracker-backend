import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { BullModule } from '@nestjs/bullmq';
import { MailConsumer } from './consumers/mail.consumer';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [MailsController],
  providers: [MailsService, MailConsumer],
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  exports: [MailsService],
})
export class MailsModule {}
