import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from './onboarding.service';
import UpdateBasicInfoSchema from './schemas/update-basic-info.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import { AvatarValidationPipe } from '../users/pipes/avatar-validation/avatar-validation.pipe';
import { Request } from 'express';
import AddProfessionalInfoSchema from './schemas/add-professional-info.schema';
import AddSummarySchema from './schemas/add-summary.schema';
import AddLocationInfoSchema from './schemas/add-location-info.schema';
import SaveSkillsSchema from '../skills/schemas/save-skills.schema';
import AddEducationInfoSchema from './schemas/add-education-info.schema';
import UpdateBasicInfoDto from './dto/update-basic-info.dto';
import AddProfessionalInfoDto from './dto/add-professional-info.dto';
import AddSummaryDto from './dto/add-summary.dto';
import AddLocationInfoDto from './dto/add-location-info.dto';
import SaveSkillsDto from '../skills/dto/save-skills.dto';
import AddEducationInfoDto from './dto/add-education-info.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Patch('basic-info')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateBasicInfo(
    @Body(new ZodValidationPipe(UpdateBasicInfoSchema))
    updateBasicInfoDto: UpdateBasicInfoDto,
    @UploadedFile(new AvatarValidationPipe())
    file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    return this.onboardingService.updateBasicInfo(
      updateBasicInfoDto,
      file ?? null,
      req,
    );
  }

  @Patch('professional')
  @HttpCode(HttpStatus.OK)
  async addProfessionalInfo(
    @Body(new ZodValidationPipe(AddProfessionalInfoSchema))
    addProfessionalInfoDto: AddProfessionalInfoDto,
    @Req() req: Request,
  ) {
    return this.onboardingService.addProfessionalInfo(
      addProfessionalInfoDto,
      req,
    );
  }

  @Patch('summary')
  @HttpCode(HttpStatus.OK)
  async addSummary(
    @Body(new ZodValidationPipe(AddSummarySchema))
    addSummaryDto: AddSummaryDto,
    @Req() req: Request,
  ) {
    return this.onboardingService.addSummary(addSummaryDto, req);
  }

  @Patch('location')
  @HttpCode(HttpStatus.OK)
  async addLocationInfo(
    @Body(new ZodValidationPipe(AddLocationInfoSchema))
    addLocationInfoDto: AddLocationInfoDto,
    @Req() req: Request,
  ) {
    return this.onboardingService.addLocationInfo(addLocationInfoDto, req);
  }

  @Patch('skills')
  @HttpCode(HttpStatus.OK)
  async addSkills(
    @Body(new ZodValidationPipe(SaveSkillsSchema))
    data: SaveSkillsDto,
    @Req() req: Request,
  ) {
    return this.onboardingService.addSkillsInfo(data, req);
  }

  @Patch('education')
  @HttpCode(HttpStatus.OK)
  async addEducationInfo(
    @Body(new ZodValidationPipe(AddEducationInfoSchema))
    addEducationInfoDto: AddEducationInfoDto,
    @Req() req: Request,
  ) {
    return this.onboardingService.addEducationInfo(addEducationInfoDto, req);
  }
}
