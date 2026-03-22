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

import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Stages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stages')
export class StagesController {
    constructor(private readonly stagesService: StagesService) {}

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create Stage' })
    create(@Body() dto: CreateStageDto) {
        return this.stagesService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all stages' })
    findAll() {
        return this.stagesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get stage by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.stagesService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update stage' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStageDto,
    ) {
        return this.stagesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete stage' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.stagesService.remove(id);
    }
}
