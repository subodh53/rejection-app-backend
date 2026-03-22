const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  await knex('users').del();

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await knex('users').insert([
    {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  ]);
};