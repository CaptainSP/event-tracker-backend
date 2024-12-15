import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @Redirect()
  @Public()
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn();
  }

  @Get('callback')
  @Redirect()
  @Public()
  async callback(@Query('code') code: string) {
    const token = await this.authService.callback(code);
    return {
      url: `http://localhost:4200/login?token=${token}`,
      statusCode: HttpStatus.FOUND,
    };
  }
}
