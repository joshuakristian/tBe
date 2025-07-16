const cors = require('cors')
const db = require('../db/db.js')

async function GetPageCount() {
  return new Promise((resolve) => {
    db.query(`SELECT COUNT (*) Page_Count FROM deals`, (err, result) => {
      resolve(result[0].Page_Count)
    })
  })
}
exports.getdeals = async (req, res, next) => {
  const {
    query: { search, currentPage, pageSize },
  } = req
  const keyword = search ? `%${search}%` : search
  let limit = Number(pageSize) || 10
  let current_Page = currentPage || 1
  let offset = current_Page - 1
  // console.log(req.query);
  if (req.query.limit) {
    let l = parseInt(req.query.limit)
    if (l > 0) {
      limit = l
    }
  }
  if (req.query.page) {
    let o = parseInt(req.query.page)
    if (o >= 0) {
      offset = o
    }
  }
  const PageCount = await GetPageCount()
  let query = `
    SELECT id,dealsName, deskripsi, kategori, tgl_m, tgl_a, jam_m, jam_a, namaToko, image, dibuat FROM deals`
  if (keyword) {
    query += `AND (kategori LIKE :keyword OR code LIKE :keyword `
    query += `OR dealsName LIKE :keyword) `
  }
  query += ` ORDER BY id DESC limit ${limit} offset ${offset * limit}`

  db.query(query, (err, result) => {
    if (err) {
      return res.status(400).send({
        status: false,
        message: err,
      })
    }
    return res.status(200).send({
      status: true,
      data: result,
      meta: {
        currentPage: Number(current_Page),
        TotalPage: Math.ceil(PageCount / limit),
        pageSize: limit,
      },
    })
  })
}

exports.getdeal = async (req, res, next) => {
  const userId = req.params.id
  const query =
    'SELECT id,dealsName, deskripsi, kategori,tgl_m, tgl_a, jam_m, jam_a, namaToko, image,dibuat FROM deals WHERE id = ?'
  db.query(query, [userId], (err, results) => {
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
        message: 'Cannot Find deals Data',
      })
    }
    const deals = results[0]
    return res.status(200).json({
      status: true,
      message: 'deals Data Found',
      deals,
    })
  })
}

exports.newDeals = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({
      status: false,
      message: 'No file detected',
    });
   }
  let Url = req.files.deals ? `/dpict/${req.files.deals[0].filename}` : null;
  const {
    dealsName,
    deskripsi,
    kategori,
    tgl_m,
    tgl_a,
    jam_m,
    jam_a,
    namaToko,
  } = req.body
  const query = `INSERT INTO deals (dealsName, deskripsi, kategori, tgl_m, tgl_a, jam_m, jam_a, namaToko, image, dibuat) VALUES (?, ?, ?, ?, ?, ?, ?, ? ,?,now())`
  const vquery = [
    dealsName,
    deskripsi,
    kategori,
    tgl_m,
    tgl_a,
    jam_m,
    jam_a,
    namaToko,
    Url,
  ]
  console.log(req.body);
  console.log(Url,);
  
  
  db.query(query, vquery, (err, result) => {
    if (err) {
      return res.status(400).send({
        status: false,
        message: err,
      })
    } else {
      return res.status(201).send({
        status: true,
        message: 'Success for submit a new deals',
      })
    }
  })
}

exports.uDeal = async (req, res, next) => {
    const {
    dealsName,
    deskripsi,
    kategori,
    tgl_m,
    tgl_a,
    jam_m,
    jam_a,
    namaToko,
  } = req.body

  const dealId = req.params.id

  try {
    const [rows] = await db.promise().query('SELECT id FROM deals WHERE id = ?', [dealId])

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: 'deals Not Found' })
    }

    let query = '';
    let params = [];

    if (req.files && req.files.deals){
    let Url = req.files.deals ? `/dpict/${req.files.deals[0].filename}` : null;
    query =  `UPDATE deals SET dealsName = ? , deskripsi = ?, kategori = ?, tgl_m = ? , tgl_a = ? , jam_m = ?, jam_a = ? , namaToko = ?, image = ? WHERE id = ?`,
    params =  [
          dealsName,
          deskripsi,
          kategori,
          tgl_m,
          tgl_a,
          jam_m,
          jam_a,
          namaToko,
          Url,
          dealId
        ]
    }else{ 
      query = `UPDATE deals SET dealsName = ? , deskripsi = ? , kategori = ? , tgl_m = ? , tgl_a = ? , jam_m = ?, jam_a = ? , namaToko = ? WHERE id = ?`,
      params =     [
          dealsName,
          deskripsi,
          kategori,
          tgl_m,
          tgl_a,
          jam_m,
          jam_a,
          namaToko,
          dealId,
        ]
    }
       
    await db.promise().query(query, params);
    return res.status(200).json({
      status: true,
      message: 'Success Update the deals',
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message, // Tambahkan pesan error ke respons
    })
  }
}

exports.delDeal = async (req, res, next) => {
  const dealId = req.params.id
  try {
    // 1. Ambil deals dari database
    const [rows] = await db
      .promise()
      .query('SELECT id FROM deals WHERE id = ?', [dealId])

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: 'deals Not Found' })
    }
    // 2. delete deals di database
    await db.promise().query('DELETE FROM deals WHERE id = ?', [dealId])

    return res.status(200).json({
      status: true,
      message: 'Success deleting the deals',
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
    })
  }
}
