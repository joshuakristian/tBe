// const mysql = require('mysql2')

// const host = '31.97.220.30'
// const username = 'untarx'
// const password = '1m2E0i0sT02@{78386}!'
// const db_name = 'te'

// const connection = mysql.createConnection({
//   host: host,
//   user: username,
//   password: password,
//   database: db_name,

//   dateStrings: true,
// })

// connection.connect()

// module.exports = connection
const mysql = require('mysql2');

let config;
try {
  config = require('../../config');
} catch (e) {
  console.log('No config file found');
  process.exit(0);
}

function connect() {
  const connection = mysql.createConnection(config.db);
  return connection;
}

function disconnect(connection) {
  connection.end();
}

async function query(sql, params = []) {
  const connection = connect();
  try {
    const [rows] = await connection.promise().query(sql, params);
    return rows;
  } finally {
    disconnect(connection);
  }
}

module.exports = {
  connect,
  disconnect,
  query,
  escape: mysql.escape
};

