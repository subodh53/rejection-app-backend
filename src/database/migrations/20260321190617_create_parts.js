exports.up = function (knex) {
  return knex.schema.createTable('parts', (table) => {
    table.increments('id').primary();

    table.string('name').notNullable();
    table
      .integer('category_id')
      .unsigned()
      .references('id')
      .inTable('categories')
      .onDelete('SET NULL');

    table.timestamps(true, true);

    table.unique(['name']); // avoid duplicate parts
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('parts');
};