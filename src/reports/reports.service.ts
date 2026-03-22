import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async getDashboardStats() {
        const today = new Date().toISOString().split('T')[0];

        // Get overall production for today
        const [prodResult] = await this.knex('production')
            .where('date', today)
            .sum('quantity as total_production');

        // Get overall rejection for today
        const [rejResult] = await this.knex('rejections')
            .where('date', today)
            .sum('quantity as total_rejection');

        const totalProduction = parseInt(prodResult?.total_production || '0');
        const totalRejection = parseInt(rejResult?.total_rejection || '0');
        
        let rejectionRate = 0;
        if (totalProduction > 0) {
            rejectionRate = (totalRejection / totalProduction) * 100;
        }

        return {
            today,
            totalProduction,
            totalRejection,
            rejectionRate: parseFloat(rejectionRate.toFixed(2)),
            totalEntries: await this.getTotalEntriesToday(today)
        };
    }

    async getReport(userId: number, startDate: string, endDate: string, type: string) {
        // Log the report generation
        await this.knex('audit_logs').insert({
            user_id: userId,
            action: 'REPORT_GENERATED',
            entity_name: 'reports',
            metadata: JSON.stringify({ startDate, endDate, type }),
        });

        if (type === 'part_performance') {
            const data = await this.knex('parts')
                .leftJoin('production', function() {
                    this.on('parts.id', '=', 'production.part_id')
                        .andOnBetween('production.date', [startDate, endDate]);
                })
                .leftJoin('rejections', function() {
                    this.on('parts.id', '=', 'rejections.part_id')
                        .andOnBetween('rejections.date', [startDate, endDate]);
                })
                .select('parts.name')
                .sum('production.quantity as total_production')
                .sum('rejections.quantity as total_rejection')
                .groupBy('parts.id', 'parts.name')
                .orderBy('total_rejection', 'desc');

            return data.map(row => ({
                ...row,
                total_production: parseInt(row.total_production || '0'),
                total_rejection: parseInt(row.total_rejection || '0'),
                rejection_rate: row.total_production > 0 
                    ? parseFloat(((row.total_rejection / row.total_production) * 100).toFixed(2)) 
                    : 0
            }));
        }

        if (type === 'stage_performance') {
            const data = await this.knex('stages')
                .leftJoin('production', function() {
                    this.on('stages.id', '=', 'production.stage_id')
                        .andOnBetween('production.date', [startDate, endDate]);
                })
                .leftJoin('rejections', function() {
                    this.on('stages.id', '=', 'rejections.stage_id')
                        .andOnBetween('rejections.date', [startDate, endDate]);
                })
                .select('stages.name')
                .sum('production.quantity as total_production')
                .sum('rejections.quantity as total_rejection')
                .groupBy('stages.id', 'stages.name')
                .orderBy('total_rejection', 'desc');

            return data.map(row => ({
                ...row,
                total_production: parseInt(row.total_production || '0'),
                total_rejection: parseInt(row.total_rejection || '0'),
                rejection_rate: row.total_production > 0 
                    ? parseFloat(((row.total_rejection / row.total_production) * 100).toFixed(2)) 
                    : 0
            }));
        }

        if (type === 'defect_distribution') {
            const data = await this.knex('defects')
                .leftJoin('rejections', function() {
                    this.on('defects.id', '=', 'rejections.defect_id')
                        .andOnBetween('rejections.date', [startDate, endDate]);
                })
                .select('defects.name')
                .sum('rejections.quantity as count')
                .groupBy('defects.id', 'defects.name')
                .orderBy('count', 'desc');

            return data.map(row => ({
                ...row,
                count: parseInt(row.count || '0')
            })).filter(row => row.count > 0);
        }

        if (type === 'trend_analysis') {
            const production = await this.knex('production')
                .whereBetween('date', [startDate, endDate])
                .select('date')
                .sum('quantity as total_production')
                .groupBy('date')
                .orderBy('date');

            const rejections = await this.knex('rejections')
                .whereBetween('date', [startDate, endDate])
                .select('date')
                .sum('quantity as total_rejection')
                .groupBy('date')
                .orderBy('date');

            // Merge production and rejections by date
            const formatDate = (date: any) => {
                const d = new Date(date);
                const month = '' + (d.getMonth() + 1);
                const day = '' + d.getDate();
                const year = d.getFullYear();
                return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
            };

            const dateMap = new Map();
            production.forEach(p => {
                const dateStr = formatDate(p.date);
                dateMap.set(dateStr, { date: dateStr, total_production: parseInt(p.total_production || '0'), total_rejection: 0 });
            });

            rejections.forEach(r => {
                const dateStr = formatDate(r.date);
                const existing = dateMap.get(dateStr) || { date: dateStr, total_production: 0, total_rejection: 0 };
                existing.total_rejection = parseInt(r.total_rejection || '0');
                dateMap.set(dateStr, existing);
            });

            return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date)).map(row => ({
                ...row,
                rejection_rate: row.total_production > 0 
                    ? parseFloat(((row.total_rejection / row.total_production) * 100).toFixed(2)) 
                    : 0
            }));
        }

        if (type === 'part_defect_analysis') {
            const data = await this.knex('rejections')
                .join('parts', 'rejections.part_id', 'parts.id')
                .join('defects', 'rejections.defect_id', 'defects.id')
                .whereBetween('date', [startDate, endDate])
                .select('parts.name as part_name', 'defects.name as defect_name')
                .sum('quantity as count')
                .groupBy('parts.name', 'defects.name');

            // Transform into a format suitable for Recharts StackedBar
            const partMap = new Map();
            data.forEach(row => {
                const part = row.part_name;
                const existing = partMap.get(part) || { name: part };
                existing[row.defect_name] = parseInt(row.count || '0');
                partMap.set(part, existing);
            });

            return Array.from(partMap.values());
        }

        if (type === 'part_stage_analysis') {
            const data = await this.knex('rejections')
                .join('parts', 'rejections.part_id', 'parts.id')
                .join('stages', 'rejections.stage_id', 'stages.id')
                .whereBetween('date', [startDate, endDate])
                .select('parts.name as part_name', 'stages.name as stage_name')
                .sum('quantity as count')
                .groupBy('parts.name', 'stages.name');

            const partMap = new Map();
            data.forEach(row => {
                const part = row.part_name;
                const existing = partMap.get(part) || { name: part };
                existing[row.stage_name] = parseInt(row.count || '0');
                partMap.set(part, existing);
            });

            return Array.from(partMap.values());
        }

        return [];
    }

    private async getTotalEntriesToday(date: string) {
        // Just an estimate of how many batch entries or rows were recorded
        const [prodCount] = await this.knex('production')
            .where('date', date)
            .count('id as count');
        
        return parseInt(prodCount?.count || '0');
    }
}
