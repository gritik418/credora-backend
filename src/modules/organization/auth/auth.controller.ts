import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { OrganizationAuthService } from './auth.service';
import RegisterOrganizationDto from './dto/register-organization.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import RegisterOrganizationSchema from './schemas/register-organization.schema';
import OrganizationLoginSchema from './schemas/organization-login.schema';
import OrganizationLoginDto from './dto/organization-login.dto';
import { Response } from 'express';

@Controller('organization/auth')
export class OrganizationAuthController {
  constructor(
    private readonly organizationAuthService: OrganizationAuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterOrganizationSchema))
    data: RegisterOrganizationDto,
  ) {
    return this.organizationAuthService.registerOrganization(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(OrganizationLoginSchema))
    data: OrganizationLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.organizationAuthService.organizationLogin(data, res);
  }
}
