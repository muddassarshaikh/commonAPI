// MYSQL Database file

const mysql = require('mysql');
const config = require('../../config');

const con = mysql.createPool({
  host: config.databaseHost,
  user: config.databaseUser,
  password: config.databasePassword,
  database: config.databaseDatabaseName,
});

module.exports = con;
