const db = require('../db/db.js')

exports.gKpn = async (req, res, next) => {
    const query = 'SELECT * FROM kupon'
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
          message: 'Cannot Find Coupon Data',
        })
      }
      const kpn = results
      return res.status(200).json({
        status: true,
        message: 'Coupon Found',
        data : kpn,
      })
    })
  }

  exports.gKpnU = async (req, res, next) => {
    const kId = req.params.kId
    const uId = req.params.uId
    const query = 'SELECT * FROM kupon WHERE id_user = ? && d_id = ?'
    db.query(query,[uId,kId], (err, results) => {
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
          message: 'Cannot Find Coupon Data',
        })
      }
      const kpn = results
      return res.status(200).json({
        status: true,
        message: 'ANDA SUDAH PUNYA KUPONNYA',
        data : kpn,
      })
    })
  }

exports.insertKupon = async (req, res, next) => {
    const dealsId = req.params.did; 
    const userId = req.params.uid
    const { status } = req.body
    const query =
      'INSERT INTO kupon (id_user , d_id ,status,tgl_pengambilan )VALUES (?,?,?,now())'
    db.query(query, [userId,dealsId,status], (err, results) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: 'Terjadi kesalahan pada server',
          error: err.message,
        })
      }
      
      return res.status(200).json({
        status: true,
        message: 'Kupon Berhasil di ambil',
      })
    })
  }
