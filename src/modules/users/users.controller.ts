import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import AddProfessionalInfoSchema from './schemas/add-professional-info.schema';
import AddProfessionalInfoDto from './dto/add-professional-info.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    return this.usersService.getMe(req);
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
}
