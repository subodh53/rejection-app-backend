import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogsService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async findAll(startDate: string, endDate: string) {
        return this.knex('audit_logs')
            .leftJoin('users', 'audit_logs.user_id', 'users.id')
            .whereBetween('audit_logs.timestamp', [`${startDate} 00:00:00`, `${endDate} 23:59:59`])
            .select('audit_logs.*', 'users.username')
            .orderBy('audit_logs.timestamp', 'desc');
    }
}
