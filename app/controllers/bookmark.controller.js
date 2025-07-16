const cors = require('cors')
const db = require('../db/db.js')

exports.gABm = async (req, res, next) => {
  const uId = req.params.uid
  const query = 'SELECT * FROM books WHERE u_id = ?'
  db.query(query, [uId], (err, results) => {
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
        message: 'Cannot Find Data',
      })
    }
    const Gbm = results
    return res.status(200).json({
      status: true,
      message: 'Data Bookmark',
      data: Gbm,
    })
  })
}

exports.gbmU = async (req, res, next) => {
  const uId = req.params.uid
  const iId = req.params.iid
  const query = 'SELECT * FROM books WHERE u_id = ? && i_id = ?'
  db.query(query, [uId, iId], (err, results) => {
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
        message: 'Cannot Find Data',
      })
    }
    return res.status(200).json({
      status: true,
      message: 'Data Bookmark',
      data: results[0],
    })
  })
}

exports.iBmk = async (req, res, next) => {
  const iId = req.params.iid;
  const uId = req.params.uid;
  const { status } = req.body;

  const checkQuery = 'SELECT id FROM books WHERE u_id = ? AND i_id = ?';
  const insertQuery = 'INSERT INTO books (u_id, i_id, status) VALUES (?, ?, ?)';

  try {
    const [rows] = await db.promise().query(checkQuery, [uId, iId]);

    if (rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'Sudah dibookmark sebelumnya',
      });
    }

    await db.promise().query(insertQuery, [uId, iId, status]);

    return res.status(200).json({
      status: true,
      message: 'Bookmark berhasil ditambahkan',
    });

  } catch (e) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
      error: e.message,
    });
  }
};

exports.delBmk = async (req, res, next) => {
  const bId = req.params.id

  if (!bId || isNaN(bId)) {
    return res.status(400).json({
      status: false,
      message: 'Invalid bookmark ID',
    })
  }

  try {
   const [
      deleteResult,
    ] = await db.promise().query('DELETE FROM books WHERE id = ?', [bId])

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: 'No bookmark was deleted',
      })
    }

    return res.status(200).json({
      status: true,
      message: 'Bookmark deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Database error occurred',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}
