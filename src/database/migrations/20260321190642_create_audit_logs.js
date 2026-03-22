exports.up = function (knex) {
  return knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.string('action').notNullable(); // CREATE, UPDATE, DELETE, REPORT_VIEW, BATCH_ENTRY

    table.string('entity_name'); // parts, production, reports, etc.
    table.integer('entity_id');

    table.jsonb('metadata'); // flexible logging

    table.timestamp('timestamp').defaultTo(knex.fn.now());

    // 🔥 INDEXES
    table.index(['user_id']);
    table.index(['action']);
    table.index(['timestamp']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('audit_logs');
};