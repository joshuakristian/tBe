const cors = require('cors')
const db = require('../db/db.js')

exports.getQotd = async (req, res, next) => {
  const query = 'SELECT * FROM qotd'
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan pada server',
        error: err.message,
      })
    }
    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Cannot Quote Data',
      })
    }
    const QOTD = results
    return res.status(200).json({
      status: true,
      message: 'Quote Found',
      data : QOTD,
    })
  })
}

exports.getMotd = async (req, res, next) => {
  const query = 'SELECT * FROM motd'
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan pada server',
        error: err.message,
      })
    }
    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Cannot Quote Data',
      })
    }
    const QOTD = results
    return res.status(200).json({
      status: true,
      message: 'Quote Found',
      data : QOTD,
    })
  })
}
