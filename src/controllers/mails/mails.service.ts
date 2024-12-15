import { Inject, Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectQueue('mail')
    private mailQueue: Queue,
  ) {}

  public startFetchingMails() {
    const user = this.request.user;
    const accessToken = user.accessToken;
    this.mailQueue.add('fetch-mails', {
      accessToken,
    }, {
      repeat: {
        every: 1000,
      },
    });
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
}
