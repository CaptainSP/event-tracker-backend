import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { BullModule } from '@nestjs/bullmq';
import { MailConsumer } from './consumers/mail.consumer';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from './entities/mail.entity';
import { GeminiConsumer } from './consumers/gemini.consumer';

@Module({
  controllers: [MailsController],
  providers: [MailsService, MailConsumer,GeminiConsumer],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Mail]),
    BullModule.registerQueue({
      name: 'mail',
    }, {
      name: 'gemini',
    }),
  ],
  exports: [MailsService],
})
export class MailsModule {}
