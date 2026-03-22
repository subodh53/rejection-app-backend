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

import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parts')
export class PartsController {
    constructor(private readonly partsService: PartsService) {}

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create Part' })
    create(@Body() dto: CreatePartDto) {
        return this.partsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all parts' })
    findAll() {
        return this.partsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get part by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.partsService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update part' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePartDto,
    ) {
        return this.partsService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete part' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.partsService.remove(id);
    }
}
