const mysql = require('mysql2')

const host = '31.97.220.30'
const username = 'untarx'
const password = '1m2E0i0sT02@{78386}!'
const db_name = 'te'

const connection = mysql.createConnection({
  host: host,
  user: username,
  password: password,
  database: db_name,

  dateStrings: true,
})

connection.connect()

module.exports = connection

