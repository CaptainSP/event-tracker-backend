import { HttpServer, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MailsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectQueue('mail')
    private mailQueue: Queue,
    private httpService: HttpService,
  ) {}

  public logger = new Logger(MailsService.name);

  public startFetchingMails() {
    const user = this.request.user;
    const accessToken = user.accessToken;
    this.mailQueue.add(
      'fetch-mails',
      {
        accessToken,
      },
      {
        repeat: {
          every: 60000, // Fetch emails every minute
        },
      },
    );
  }

  create(createMailDto: CreateMailDto) {
    return 'This action adds a new mail';
  }

  findAll() {
    return `This action returns all mails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mail`;
  }

  update(id: number, updateMailDto: UpdateMailDto) {
    return `This action updates a #${id} mail`;
  }

  remove(id: number) {
    return `This action removes a #${id} mail`;
  }

  public async addEvent(accessToken, eventDetails) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://graph.microsoft.com/v1.0/me/events',
          eventDetails,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const event = response.data;
      this.logger.log('Event created:', event.id);
      return event;
    } catch (error) {
      this.logger.error(
        'Error creating event:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
