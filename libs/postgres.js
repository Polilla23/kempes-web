const { Client } = require('pg');
const { Model } = require('sequelize');

async function getConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: '1234',
    database: 'kempes'
  });
  await client.connect();
  return client;
}

module.exports = getConnection;
