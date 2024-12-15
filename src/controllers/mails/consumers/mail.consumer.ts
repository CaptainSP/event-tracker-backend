import { HttpService } from '@nestjs/axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Processor('mail', {
  concurrency: 1,
})
export class MailConsumer extends WorkerHost {
  constructor(private readonly httpService: HttpService) {
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
            $select: 'subject,sender,receivedDateTime,bodyPreview', // Fields to fetch
          },
        }),
      );

      const data = response.data.value; // List of emails
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
