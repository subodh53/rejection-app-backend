exports.up = function (knex) {
  return knex.schema.createTable('production', (table) => {
    table.increments('id').primary();

    table
      .integer('part_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('parts')
      .onDelete('CASCADE');

    table
      .integer('stage_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('stages')
      .onDelete('CASCADE');

    table.date('date').notNullable();

    table.integer('quantity').notNullable();

    table
      .integer('created_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.timestamp('created_at').defaultTo(knex.fn.now());

    // 🔥 INDEXES (CRITICAL FOR REPORTING)
    table.index(['date']);
    table.index(['part_id']);
    table.index(['stage_id']);
    table.index(['part_id', 'date']);
    table.index(['stage_id', 'date']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('production');
};