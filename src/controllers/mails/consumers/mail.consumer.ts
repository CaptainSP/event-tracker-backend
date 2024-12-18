import { HttpService } from '@nestjs/axios';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Mail } from '../entities/mail.entity';

@Processor('mail', {
})
export class MailConsumer extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    @InjectQueue('gemini') private gemini: Queue,
    @InjectRepository(Mail) private mailRepository: Repository<Mail>,
  ) {
    super();
    console.log('Mail consumer initialized');
  }

  public logger = new Logger(MailConsumer.name);

  async process(job: any) {
    this.logger.log('Processing job:', job.id);
    return await this.fetchEmails(job.data.accessToken);
  }

  // Step 3: Fetch user emails from Microsoft Graph
  async fetchEmails(accessToken) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://graph.microsoft.com/v1.0/me/messages', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            $top: 10, // Number of emails to fetch
            $select: 'subject,sender,receivedDateTime,bodyPreview,body', // Fields to fetch
          },
        }),
      );

      const data = response.data.value; // List of emails
      for (const email of data) {
        const existingMail = await this.mailRepository.findOne({
          where: {
            outlookId: email.id,
          },
        });
        if (existingMail) {
          this.logger.log('Email already exists:', email.id);
          continue;
        } else {
          const result = await this.gemini.add('add', {
            email,
            accessToken
          });
          await this.mailRepository.save({
            outlookId: email.id,
            subject: email.subject,
            senderName: email.sender.emailAddress.name,
            sender: email.sender.emailAddress.address,
            body: email.body.content,
          });
          this.logger.log('Added job to Gemini:', result.id);
        }
      }
      this.logger.log('Fetched emails:', data.length);
    } catch (error) {
      this.logger.error(
        'Error fetching emails:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
