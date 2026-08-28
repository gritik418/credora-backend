import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import AddProfessionalInfoSchema from './schemas/add-professional-info.schema';
import AddProfessionalInfoDto from './dto/add-professional-info.dto';
import UpdateBasicInfoSchema from './schemas/update-basic-info.schema';
import UpdateBasicInfoDto from './dto/update-basic-info.dto';
import { AvatarValidationPipe } from './pipes/avatar-validation/avatar-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import AddSummarySchema from './schemas/add-summary.schema';
import AddSummaryDto from './dto/add-summary.dto';
import AddLocationInfoSchema from './schemas/add-location-info.schema';
import AddLocationInfoDto from './dto/add-location-info.dto';
import SaveSkillsSchema from '../skills/schemas/save-skills.schema';
import SaveSkillsDto from '../skills/dto/save-skills.dto';
import AddEducationInfoSchema from './schemas/add-education-info.schema';
import AddEducationInfoDto from './dto/add-education-info.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    return this.usersService.getMe(req);
  }

  @Patch('me/basic-info')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateBasicInfo(
    @Body(new ZodValidationPipe(UpdateBasicInfoSchema))
    updateBasicInfoDto: UpdateBasicInfoDto,
    @UploadedFile(new AvatarValidationPipe())
    file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    return this.usersService.updateBasicInfo(
      updateBasicInfoDto,
      file ?? null,
      req,
    );
  }

  @Patch('me/professional')
  @HttpCode(HttpStatus.OK)
  async addProfessionalInfo(
    @Body(new ZodValidationPipe(AddProfessionalInfoSchema))
    addProfessionalInfoDto: AddProfessionalInfoDto,
    @Req() req: Request,
  ) {
    return this.usersService.addProfessionalInfo(addProfessionalInfoDto, req);
  }

  @Patch('me/summary')
  @HttpCode(HttpStatus.OK)
  async addSummary(
    @Body(new ZodValidationPipe(AddSummarySchema))
    addSummaryDto: AddSummaryDto,
    @Req() req: Request,
  ) {
    return this.usersService.addSummary(addSummaryDto, req);
  }

  @Patch('me/location')
  @HttpCode(HttpStatus.OK)
  async addLocationInfo(
    @Body(new ZodValidationPipe(AddLocationInfoSchema))
    addLocationInfoDto: AddLocationInfoDto,
    @Req() req: Request,
  ) {
    return this.usersService.addLocationInfo(addLocationInfoDto, req);
  }

  @Patch('me/skills')
  @HttpCode(HttpStatus.OK)
  async addSkills(
    @Body(new ZodValidationPipe(SaveSkillsSchema))
    data: SaveSkillsDto,
    @Req() req: Request,
  ) {
    return this.usersService.addSkillsInfo(data, req);
  }

  @Patch('me/education')
  @HttpCode(HttpStatus.OK)
  async addEducationInfo(
    @Body(new ZodValidationPipe(AddEducationInfoSchema))
    addEducationInfoDto: AddEducationInfoDto,
    @Req() req: Request,
  ) {
    return this.usersService.addEducationInfo(addEducationInfoDto, req);
  }
}
