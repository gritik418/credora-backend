import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import CreateOrganizationDto from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreateOrganizationSchema from './schemas/create-organization.schema';

@Controller('organizations')
@UseGuards(AuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  createOrganization(
    @Body(new ZodValidationPipe(CreateOrganizationSchema))
    createOrganizationDto: CreateOrganizationDto,
    @Req() req: Request,
  ) {
    return this.organizationsService.createOrganization(
      createOrganizationDto,
      req,
    );
  }
}
