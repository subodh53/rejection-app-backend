import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PartsService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async create(data: { name: string; category_id?: number }) {
        const [part] = await this.knex('parts')
            .insert(data)
            .returning('*');

        return part;
    }

    async findAll() {
        return this.knex('parts').select('*').orderBy('id', 'desc');
    }

    async findOne(id: number) {
        const part = await this.knex('parts')
            .where({ id })
            .first();

        if (!part) {
            throw new NotFoundException(`Part with ID ${id} not found`);
        }

        return part;
    }

    async update(id: number, data: { name?: string; category_id?: number }) {
        const [part] = await this.knex('parts')
            .where({ id })
            .update(data)
            .returning('*');

        if (!part) {
            throw new NotFoundException(`Part with ID ${id} not found`);
        }

        return part;
    }

    async remove(id: number) {
        const [part] = await this.knex('parts')
            .where({ id })
            .delete()
            .returning('*');

        if (!part) {
            throw new NotFoundException(`Part with ID ${id} not found`);
        }

        return part;
    }
}
