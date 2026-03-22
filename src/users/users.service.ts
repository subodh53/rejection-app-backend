import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

    async findByUsername(username: string) {
        return this.knex('users').where({ username }).first();
    }

    async findById(id: number) {
        return this.knex('users').where({ id }).first();
    }
}
