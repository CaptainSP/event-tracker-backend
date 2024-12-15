import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as qs from 'qs';
import { firstValueFrom } from 'rxjs';
import { MailsService } from 'src/controllers/mails/mails.service';
import { User } from 'src/controllers/users/entities/user.entity';
import { UsersService } from 'src/controllers/users/users.service';

declare module 'express' {
  interface Request {
    user: User | undefined;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
    private mailService: MailsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  public logger = new Logger(AuthService.name);

  tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;

  async signIn() {
    const params = qs.stringify({
      client_id: this.configService.get('MAIL_CLIENT_ID'),
      response_type: 'code',
      redirect_uri: this.configService.get('MAIL_REDIRECT_URI'),
      response_mode: 'query',
      scope: this.configService.get('MAIL_SCOPE'),
    });
    const authorizeUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`;
    return {
      url: `${authorizeUrl}?${params}`,
    };
    // const payload = {};
    // return {
    //   access_token: await this.jwtService.signAsync(payload),
    // };
  }

  async completeLogin(accessToken: string) {
    const email = await this.fetchEmailOfUser(accessToken);
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      const user = await this.usersService.create({ email, accessToken });
      return await this.createJwtByUser(user);
    } else {
      const updated = await this.usersService.update(user.id, { accessToken });
      return await this.createJwtByUser(updated);
    }
  }

  async createJwtByUser(user: User) {
    const payload = { email: user.email, sub: user.id };
    this.request.user = user;
    const token = await this.jwtService.signAsync(payload);
    this.mailService.startFetchingMails();
    return token;
  }

  async callback(code: string) {
    try {
      // Exchange authorization code for tokens
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          this.tokenUrl,
          qs.stringify({
            client_id: this.configService.get('MAIL_CLIENT_ID'),
            client_secret: this.configService.get('MAIL_CLIENT_SECRET'),
            code: code,
            redirect_uri: this.configService.get('MAIL_REDIRECT_URI'),
            grant_type: 'authorization_code',
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      const { id_token, access_token } = tokenResponse.data;

      return await this.completeLogin(access_token);

      // // Fetch emails using the access token
      // const emails = await this.fetchEmails(access_token);
      // return emails;
    } catch (error) {
      this.logger.error(
        'Error during token exchange:',
        error.response?.data || error.message,
      );
    }
  }

  async fetchEmailOfUser(accessToken) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://graph.microsoft.com/v1.0/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      return response.data.mail;
    } catch (error) {
      this.logger.error(
        'Error fetching user email:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
