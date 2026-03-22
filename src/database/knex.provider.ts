import knex from 'knex';
import knexConfig from '../../knexfile';

export const KnexProvider = {
  provide: 'KNEX_CONNECTION',
  useFactory: () => {
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    return knex(knexConfig[env]);
  },
};