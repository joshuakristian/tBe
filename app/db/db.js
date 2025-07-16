const mysql = require('mysql2')

const host = 'localhost'
const username = 'root'
const password = ''
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
