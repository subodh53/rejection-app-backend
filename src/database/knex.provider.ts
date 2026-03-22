import knex from 'knex';
import knexConfig from '../../knexfile';

export const KnexProvider = {
  provide: 'KNEX_CONNECTION',
  useFactory: () => {
    return knex(knexConfig.development);
  },
};