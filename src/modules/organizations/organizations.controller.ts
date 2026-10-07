import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreateOrganizationDto from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';
import CreateOrganizationSchema from './schemas/create-organization.schema';

@UseGuards(AuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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

  @Get()
  @HttpCode(HttpStatus.OK)
  getOrganizations(@Req() req: Request) {
    return this.organizationsService.getOrganizations(req);
  }
}
