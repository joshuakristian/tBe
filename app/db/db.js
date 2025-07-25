const mysql = require('mysql2')
require('dotenv').config()
const env = process.env

const connection = mysql.createConnection({
  host: env.HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  dateStrings: true,
})

connection.connect()

module.exports = connection

// const mysql = require('mysql2')
// require('dotenv').config()
// const env = process.env

// const pool = mysql.createPool({
//   host: env.HOST,
//   user: env.DB_USER,
//   password: env.DB_PASSWORD,
//   database: env.DB_NAME,
//   dateStrings: true,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// })

// const connect = () => {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (err) {
//         console.error('Database connection failed:', err)
//         reject(err)
//         return
//       }
//       console.log('Database connected successfully!')
//       connection.release()
//       resolve(pool)
//     })
//   })
// }

// const disconnect = () => {
//   return new Promise((resolve, reject) => {
//     pool.end((err) => {
//       if (err) {
//         console.error('Error closing database connection:', err)
//         reject(err)
//         return
//       }
//       console.log('Database connection closed successfully!')
//       resolve()
//     })
//   })
// }

// module.exports = {
//   pool,
//   connect,
//   disconnect,

//   query: (sql, params) => {
//     return new Promise((resolve, reject) => {
//       pool.execute(sql, params, (err, results) => {
//         if (err) reject(err)
//         else resolve(results)
//       })
//     })
//   }
// }