import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailsService } from './mails.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Public } from 'src/decorators/public.decorator';

@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService,
    @InjectQueue('mail') private readonly mailQueue: Queue,
    @InjectQueue('gemini') private readonly geminiQueue: Queue,
  ) {}

  @Post()
  create(@Body() createMailDto: CreateMailDto) {
    return this.mailsService.create(createMailDto);
  }

  @Get()
  findAll() {
    return this.mailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMailDto: UpdateMailDto) {
    return this.mailsService.update(+id, updateMailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mailsService.remove(+id);
  }

  @Post('clean-all-queues')
  @Public()
  async cleanAllQueues() {
    await this.mailQueue.obliterate();
    await this.geminiQueue.obliterate();
    return 'Cleaned';
  }
}
