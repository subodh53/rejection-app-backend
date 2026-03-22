import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoriesService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async create(data: { name: string }) {
        const [category] = await this.knex('categories')
            .insert(data)
            .returning('*');

        return category;
    }

    async findAll() {
        return this.knex('categories').select('*').orderBy('id', 'desc');
    }

    async findOne(id: number) {
        const category = await this.knex('categories')
            .where({ id })
            .first();

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async update(id: number, data: { name?: string }) {
        const [category] = await this.knex('categories')
            .where({ id })
            .update(data)
            .returning('*');

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async remove(id: number) {
        const [category] = await this.knex('categories')
            .where({ id })
            .delete()
            .returning('*');

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }
}
