import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) {}

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Get all audit logs filtered by a date range (Admin Only)' })
    @ApiQuery({ name: 'startDate', example: '2026-03-01' })
    @ApiQuery({ name: 'endDate', example: '2026-03-22' })
    async findAll(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.auditLogsService.findAll(startDate, endDate);
    }
}
