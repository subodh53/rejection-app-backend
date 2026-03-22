import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { metadata } from 'reflect-metadata/no-conflict';

@Injectable()
export class EntriesService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async createBatch(userId: number, dto: any) {
        const { stage_id, date, entries } = dto;

        return this.knex.transaction(async (trx) => {
            let productionCount = 0;
            let rejectionCount = 0;

            for (const row of entries) {
                const {
                    part_id,
                    production_qty,
                    rejection_qty,
                    defect_id,
                } = row;
                
                if (rejection_qty > 0 && !defect_id) {
                    throw new BadRequestException(
                        'Defect is required when rejection quantity > 0',
                    );
                }

                if (production_qty === 0 && rejection_qty === 0){
                    continue;
                }

                if (production_qty > 0) {
                    await trx('production').insert({
                        part_id,
                        stage_id,
                        date,
                        quantity: production_qty,
                        created_by: userId,
                    });
                    productionCount++;
                }

                if (rejection_qty > 0) {
                    await trx('rejections').insert({
                        part_id,
                        stage_id,
                        defect_id,
                        date,
                        quantity: rejection_qty,
                        created_by: userId,
                    });
                    rejectionCount++;
                }
            }

            // Fetch Stage Name for logging
            const [stage] = await trx('stages').where('id', stage_id).select('name');
            const stageName = stage?.name || 'Unknown Stage';

            // Prepare entries with names for audit log
            const entriesWithNames: any[] = [];
            for (const e of entries) {
                const [part] = await trx('parts').where('id', e.part_id).select('name');
                let defectName = null;
                if (e.defect_id) {
                    const [defect] = await trx('defects').where('id', e.defect_id).select('name');
                    defectName = defect?.name;
                }
                
                entriesWithNames.push({
                    part_id: e.part_id,
                    part_name: part?.name || 'Unknown Part',
                    production_qty: e.production_qty,
                    rejection_qty: e.rejection_qty,
                    defect_id: e.defect_id,
                    defect_name: defectName
                });
            }

            await trx('audit_logs').insert({
                user_id: userId,
                action: 'BATCH_ENTRY',
                entity_name: 'entries',
                metadata: JSON.stringify({
                    stage_id,
                    stage_name: stageName,
                    date,
                    production_count: productionCount,
                    rejection_count: rejectionCount,
                    entries: entriesWithNames
                }),
            });

            return {
                message: 'Entries saved successfully',
                production_count: productionCount,
                rejection_count: rejectionCount,
            };
        });
    }
}
