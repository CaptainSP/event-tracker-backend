import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/controllers/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthroizeGuard } from 'src/guards/auth/authorize.guard';
import { HttpModule } from '@nestjs/axios';
import { MailsModule } from 'src/controllers/mails/mails.module';

require('dotenv').config();

@Module({
  imports: [
    UsersModule,
    HttpModule,
    forwardRef(() => MailsModule),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60d' },
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthroizeGuard,
    },
  ],
})
export class AuthModule {}
