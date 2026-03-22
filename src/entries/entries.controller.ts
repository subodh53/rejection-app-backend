import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';

import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entries')
export class EntriesController {
    constructor(private readonly entriesService: EntriesService) {}

    @Post('batch')
    @ApiOperation({ summary: 'Create batch entries (stage-based)' })
    createBatch(@Req() req, @Body() dto: CreateEntryDto) {
        const userId = req.user.sub;
    return this.entriesService.createBatch(userId, dto);
    }
}
