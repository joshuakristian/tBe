const mysql = require('mysql2')

// const host = '31.97.220.30'
// const username = 'untarx'
// const password = '1m2E0i0sT02@{78386}!'
// const db_name = 'te'
const config = require('../../config')

const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,

  dateStrings: true,
})

connection.connect()

module.exports = connection

