import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './controllers/users/users.module';
import { MailsModule } from './controllers/mails/mails.module';
import { TagsModule } from './controllers/tags/tags.module';
import { EventsModule } from './controllers/events/events.module';
import { SettingsModule } from './controllers/settings/settings.module';

const migrations = ['dist/migrations/**/*{.ts,.js}'];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({
        load: [configuration],
      })],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        database: configService.get('database.database'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        synchronize: true,
        logging: false,
        // get from file system
        migrations: migrations,
        subscribers: [],
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
    MailsModule,
    TagsModule,
    EventsModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
