import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { DefectsService } from './defects.service';
import { CreateDefectDto } from './dto/create-defect.dto';
import { UpdateDefectDto } from './dto/update-defect.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Defects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('defects')
export class DefectsController {
    constructor(private readonly defectsService: DefectsService) {}

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create Defect' })
    create(@Body() dto: CreateDefectDto) {
        return this.defectsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all defects' })
    findAll() {
        return this.defectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get defect by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.defectsService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update defect' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDefectDto,
    ) {
        return this.defectsService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete defect' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.defectsService.remove(id);
    }
}
