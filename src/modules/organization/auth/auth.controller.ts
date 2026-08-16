import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OrganizationAuthService } from './auth.service';
import RegisterOrganizationDto from './dto/register-organization.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import RegisterOrganizationSchema from './schemas/register-organization.schema';

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
}
