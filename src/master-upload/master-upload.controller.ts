import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MasterUploadService, UploadResult } from './master-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Master Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('master-upload')
export class MasterUploadController {
  constructor(private readonly masterUploadService: MasterUploadService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk upload master data from Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Req() req, @UploadedFile() file: any): Promise<UploadResult> {
    const userId = req.user?.sub;
    // Note: Pass userId to service if you want to track who performed the upload in audit logs
    return this.masterUploadService.processUpload(file.buffer);
  }
}
