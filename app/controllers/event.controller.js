const cors = require('cors')
const db = require('../db/db.js')

async function GetPageCount() {
  return new Promise((resolve) => {
    db.query(`SELECT COUNT (*) Page_Count FROM event`, (err, result) => {
      resolve(result[0].Page_Count)
    })
  })
}
exports.getevents = async (req, res, next) => {
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
    SELECT id,namaEvent, penyelenggara ,lokasi, deskripsi, kategori,tgl_m,tgl_a, jam_m, jam_a,link,image, formId FROM event`
  if (keyword) {
    query += `AND (namaEvent LIKE :keyword OR hashtag LIKE :keyword `
    query += `OR kategori LIKE :keyword) `
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


exports.getevent = async (req,res,next) => {
  const userId = req.params.id;
  const query = 'SELECT id,namaEvent, penyelenggara, lokasi, deskripsi, tgl_m,tgl_a, jam_m, jam_a,link,image,formId FROM event WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan pada server',
        error: err.message,
      });
    }
    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Pengguna tidak ditemukan',
      });
    }
    const event = results[0];
    return res.status(200).json({
      status: true,
      message: 'Data event berhasil ditemukan',
      event 
    });
  });
}


exports.newEvents = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({
      status: false,
      message: 'No file detected',
    });
   }
  let Url = req.files.event ? `/pic/${req.files.event[0].filename}` : null;
  const {
    namaEvent,
    penyelenggara,
    lokasi,
    deskripsi,
    kategori,
    tgl_m,
    tgl_a, 
    jam_m, 
    jam_a,
    link,
  } = req.body

  const user = req.users;

  const query = `INSERT INTO event (namaEvent,penyelenggara ,lokasi, deskripsi,kategori, tgl_m,tgl_a, jam_m, jam_a, link ,image, dibuat, createdBy) VALUES (?, ?, ? , ?, ?, ?, ?, ?, ?, ?, ?,now(), ?)`
  const vquery = [
    namaEvent,
    penyelenggara,
    lokasi,
    deskripsi,
    kategori,
    tgl_m,
    tgl_a, 
    jam_m, 
    jam_a,
    link,
    Url,
    user.userId
  ]
  db.query(query, vquery, (err, result) => {
    if (err) {
      return res.status(400).send({
        status: false,
        message: err,
      })
    } else {
      return res.status(201).send({
        status: true,
        message: 'Success for submit a new event',
      })
    }
  })
}

exports.uEvent = async (req, res, next) => {
  const {
    namaEvent,
    penyelenggara,
    lokasi,
    deskripsi,
    tgl_m,
    tgl_a,
    jam_m,
    jam_a,
    link,
  } = req.body;

  const eventId = req.params.id;

  try {

    const [rows] = await db
      .promise()
      .query('SELECT id FROM event WHERE id = ?', [eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: 'Event Not Found' });
    }
    
    let query = '';
    let params = [];
    if (req.files && req.files.event){
    let Url = req.files.event ? `/pic/${req.files.event[0].filename}` : null;
    query = `UPDATE event SET namaEvent = ?, penyelenggara = ?,  lokasi = ?, deskripsi = ?, tgl_m = ? ,tgl_a = ?,jam_m = ? ,jam_a = ?, link = ?, image = ? WHERE id = ?`
    params = [
          namaEvent,
          lokasi,
          deskripsi,
          tgl_m,
          tgl_a, 
          jam_m, 
          jam_a,
          link,
          Url,
          eventId,
        ]
    }else{
      query = `UPDATE event SET namaEvent = ?, penyelenggara = ?, lokasi = ?, deskripsi = ?, tgl_m = ? ,tgl_a = ?,jam_m = ? ,jam_a = ?, link = ? WHERE id = ?`,
    params = [
          namaEvent,
          penyelenggara,
          lokasi,
          deskripsi,
          tgl_m,
          tgl_a, 
          jam_m, 
          jam_a,
          link,
          eventId,
        ]
    }
     console.log(req.body);
    await db.promise().query(query, params);
    return res.status(200).json({
      status: true,
      message: 'Success Update the event',
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message, // Tambahkan pesan error ke respons
    });
  }
};

exports.delEvent = async (req, res, next) => {
  const eventId = req.params.id
  try {
    // 1. Ambil event dari database
    const [rows] = await db
      .promise()
      .query('SELECT id FROM event WHERE id = ?', [eventId])

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: 'Event Not Found' })
    }
    // 2. delete event di database
    await db.promise().query('DELETE FROM event WHERE id = ?', [eventId])

    return res.status(200).json({
      status: true,
      message: 'Success deleting the event',
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
    })
  }
}

  exports.gEvtU = async (req, res, next) => {
    const { userId, formId, eventId } = req.params
    const query = 'SELECT * FROM f_responses WHERE userId = ? && formId = ? && eventId = ?'
    db.query(query,[userId, formId, eventId], (err, results) => {
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
          message: 'Cannot Find Registered Event Data',
        })
      }
      const hist = results
      return res.status(200).json({
        status: true,
        message: 'You have registered to this event',
        data : hist,
      })
    })
  }
