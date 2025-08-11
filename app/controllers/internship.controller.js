const cors = require('cors')
const db = require('../db/db.js')

async function GetPageCount() {
  return new Promise((resolve) => {
    db.query(`SELECT COUNT (*) Page_Count FROM internship`, (err, result) => {
      resolve(result[0].Page_Count)
    })
  })
}
exports.getinterns = async (req, res, next) => {
  const {
    query: { search, currentPage, pageSize },
  } = req
  const keyword = search ? `%${search}%`: search
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
    SELECT id, judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi, tgjwb, fslts, image, dibuat, link FROM internship`
  if (keyword) {
    query += `AND (judul LIKE :keyword OR code LIKE :keyword `
    query += `OR perusahaan LIKE :keyword) `
    query += `OR lokasi LIKE :keyword) `
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

exports.getintern = async (req, res, next) => {
  const internId = req.params.id
  const query =
    'SELECT id, judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi, tgjwb, fslts, image, dibuat, link FROM internship WHERE id = ?'
  db.query(query, [internId], (err, results) => {
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
        message: 'Cannot Find internship Data',
      })
    }
    const deals = results[0]
    return res.status(200).json({
      status: true,
      message: 'internship Data Found',
      deals,
    })
  })
}

exports.newIntern = async (req, res, next) => {
  console.log(req.file);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({
      status: false,
      message: 'No file detected',
    })
  }

  const { judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi, link } = req.body

  let intern = req.files.intern ? `/internpic/${req.files.intern[0].filename}` : null

  const query = `INSERT INTO internship (judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi, tgjwb, fslts, image, dibuat, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), ?)`
  const vquery = [judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi, link]

  db.query(query, vquery, (err, result) => {
    if (err) {
      return res.status(400).send({
        status: false,
        message: err.message,
      })
    } else {
      return res.status(201).send({
        status: true,
        message: 'Success for submitting an internship',
      })
    }
  })
}

exports.uIntern = async (req, res, next) => {
  const { judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi , tgjwb, fslts, link } = req.body;
  const internId = req.params.id;

  try {
    const [rows] = await db.promise().query('SELECT id FROM internship WHERE id = ?', [internId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Data Internship Tidak ada',
      });
    }

    let query = '';
    let params = [];

    if (req.files && req.files.intern) {
      const internImage = `/internpic/${req.files.intern[0].filename}`;
      query = `
        UPDATE internship SET 
        judul = ?, jabatan = ?, perusahaan = ?, detailPerusahaan = ?, deskripsiPekerjaan = ?, 
        tgl_m = ?, tgl_a = ?, jam_m = ?, jam_a = ?, lokasi = ?, tgjwb = ?, fslts = ?, image = ?, link = ?
        WHERE id = ?`;
      params = [judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi, tgjwb, fslts, internImage, link, internId];
    } else {
      query = `
        UPDATE internship SET 
        judul = ?, jabatan = ?, perusahaan = ?, detailPerusahaan = ?, deskripsiPekerjaan = ?, 
        tgl_m = ?, tgl_a = ?, jam_m = ?, jam_a = ?, lokasi = ?, tgjwb = ?, fslts = ?, link = ?
        WHERE id = ?`;
      params = [judul, jabatan, perusahaan, detailPerusahaan, deskripsiPekerjaan, tgl_m, tgl_a, jam_m, jam_a, lokasi, tgjwb, fslts, link, internId];
    }

    console.log(params)

    await db.promise().query(query, params);

    return res.status(200).json({
      status: true,
      message: 'Berhasil memperbarui data internship',
    });
  } catch (error) {
    console.error('Error updating intern:', error.message);
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

exports.delIntern = async (req, res, next) => {
  const internId = req.params.id
  try {
    const [
      rows,
    ] = await db
      .promise()
      .query('SELECT id FROM internship WHERE id = ?', [internId])

    if (rows.length === 0) {
      return res
        .status(404) 
        .json({ status: false, message: 'internship data Not Found' })
    }
    await db.promise().query('DELETE FROM internship WHERE id = ?', [internId])

    return res.status(200).json({
      status: true,
      message: 'Success deleting the internship data',
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
    })
  }
}