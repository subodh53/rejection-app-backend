import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('dashboard-stats')
    @ApiOperation({ summary: 'Get current day summary statistics for dashboard' })
    async getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }

    @Get()
    @ApiOperation({ summary: 'Generate custom reports based on duration' })
    @ApiQuery({ name: 'startDate', example: '2026-03-01' })
    @ApiQuery({ name: 'endDate', example: '2026-03-22' })
    @ApiQuery({ name: 'type', enum: ['summary', 'detailed'], default: 'summary' })
    async getReport(
        @Req() req: any,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('type') type: string = 'summary'
    ) {
        const userId = req.user.sub;
        return this.reportsService.getReport(userId, startDate, endDate, type);
    }
}
