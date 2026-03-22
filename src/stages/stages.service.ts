import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class StagesService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async create(data: { name: string }) {
        const [stage] = await this.knex('stages')
            .insert(data)
            .returning('*');

        return stage;
    }

    async findAll() {
        return this.knex('stages').select('*').orderBy('id', 'desc');
    }

    async findOne(id: number) {
        const stage = await this.knex('stages')
            .where({ id })
            .first();

        if (!stage) {
            throw new NotFoundException(`Stage with ID ${id} not found`);
        }

        return stage;
    }

    async update(id: number, data: { name?: string }) {
        const [stage] = await this.knex('stages')
            .where({ id })
            .update(data)
            .returning('*');

        if (!stage) {
            throw new NotFoundException(`Stage with ID ${id} not found`);
        }

        return stage;
    }

    async remove(id: number) {
        const [stage] = await this.knex('stages')
            .where({ id })
            .delete()
            .returning('*');

        if (!stage) {
            throw new NotFoundException(`Stage with ID ${id} not found`);
        }

        return stage;
    }
}
