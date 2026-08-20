import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import RegisterSchema from './schemas/register.schema';
import LoginDto from './dto/login.dto';
import { Request, Response } from 'express';
import LoginSchema from './schemas/login.schema';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import VerifyEmailSchema from './schemas/verify-email.schema';
import VerifyEmailDto from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) data: RegisterDto,
  ) {
    return this.authService.register(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(data, res);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new ZodValidationPipe(VerifyEmailSchema)) data: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyEmail(data, res);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    return this.authService.getMe(req);
  }
}
