import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [
    TypeOrmModule.forFeature([Event]),

  ],
  exports: [EventsService, TypeOrmModule]
})
export class EventsModule {}
