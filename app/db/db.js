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
    const connection = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        dateStrings: true,
    });

    return connection;
}

function disconnect(connection) {
    connection.end();
}

module.exports = {
    connect,
    disconnect,
    escape: mysql.escape 
};

