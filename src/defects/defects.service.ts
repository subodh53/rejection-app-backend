import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DefectsService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async create(data: { name: string }) {
        const [defect] = await this.knex('defects')
            .insert(data)
            .returning('*');

        return defect;
    }

    async findAll() {
        return this.knex('defects')
            .select('*')
            .orderBy('id', 'desc');
    }

    async findOne(id: number) {
        const defect = await this.knex('defects')
            .select('*')
            .where('id', id)
            .first();

        if (!defect) {
            throw new NotFoundException(`Defect with ID ${id} not found`);
        }

        return defect;
    }

    async update(id: number, data: { name?: string }) {
        const [defect] = await this.knex('defects')
            .where({ id })
            .update(data)
            .returning('*');

        if (!defect) {
            throw new NotFoundException(`Defect with ID ${id} not found`);
        }

        return defect;
    }

    async remove(id: number) {
        const [defect] = await this.knex('defects')
            .where({ id })
            .delete()
            .returning('*');

        if (!defect) {
            throw new NotFoundException(`Defect with ID ${id} not found`);
        }

        return defect;
    }
}
