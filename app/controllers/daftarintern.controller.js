const cors = require('cors')
const db = require('../db/db.js')

async function GetPageCount() {
  return new Promise((resolve) => {
    db.query(`SELECT COUNT (*) Page_Count FROM intern`, (err, result) => {
      resolve(result[0].Page_Count)
    })
  })
}
exports.getDInterns = async (req, res, next) => {
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
    SELECT id,nama, nim , jurusan , ipk, cv, lamaran , ktp, krrs, dibuat FROM intern`
  if (keyword) {
    query += `AND (nama LIKE :keyword OR code LIKE :keyword `
    query += `OR nim LIKE :keyword) `
    query += `OR jurusan LIKE :keyword) `
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

exports.getDIntern = async (req, res, next) => {
  const internId = req.params.id
  const query =
    'SELECT id,nama, nim , jurusan , ipk, cv, lamaran , ktp, krrs,dibuat FROM intern WHERE id = ?'
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
    const intern = results[0]
    return res.status(200).json({
      status: true,
      message: 'internship Data Found',
      data : intern,
    })
  })
}

exports.newDIntern = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({
      status: false,
      message: 'No file detected',
    })
  }

  const { nama, nim, fakultas, jurusan, ipk } = req.body

  // Pastikan setiap field file ada
  let cv = req.files.cv ? `/cv/${req.files.cv[0].filename}` : null
  let lamaran = req.files.lamaran
    ? `/lamaran/${req.files.lamaran[0].filename}`
    : null
  let ktp = req.files.ktp ? `/identitas/${req.files.ktp[0].filename}` : null
  let krrs = req.files.krrs ? `/krrs/${req.files.krrs[0].filename}` : null

  if (!cv || !lamaran || !ktp || !krrs) {
    return res.status(400).send({
      status: false,
      message: 'All required files (cv, lamaran, ktp, krrs) must be uploaded',
    })
  }

  const query = `INSERT INTO intern (nama, nim, fakultas, jurusan, ipk, cv, lamaran, ktp, krrs, dibuat) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, now())`
  const vquery = [nama, nim, fakultas, jurusan, ipk, cv, lamaran, ktp, krrs]

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

// exports.uIntern = async (req, res, next) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send({
//       status: false,
//       message: 'No file detected',
//     })
//   }

//   const { nama, nim, fakultas, jurusan, ipk } = req.body

//   let cv = req.files.cv ? `/cv/${req.files.cv[0].filename}` : null
//   let lamaran = req.files.lamaran
//     ? `/lamaran/${req.files.lamaran[0].filename}`
//     : null
//   let ktp = req.files.ktp ? `/identitas/${req.files.ktp[0].filename}` : null
//   let krrs = req.files.krrs ? `/krrs/${req.files.krrs[0].filename}` : null

//   const internId = req.params.id
//   if (!cv || !lamaran || !ktp || !krrs) {
//     return res.status(400).send({
//       status: false,
//       message: 'All required files (cv, lamaran, ktp, krrs) must be uploaded',
//     })
//   }

//   const ipkValue = parseFloat(ipk);
//   if (isNaN(ipkValue)) {
//     return res.status(400).json({
//       status: false,
//       message: 'IPK harus berupa angka yang valid',
//     });
//   }
//   console.log({
//   nama, nim, fakultas, jurusan, ipk: ipkValue, cv, lamaran, ktp, krrs, internId
// });
//   try {
//     const [
//       rows,
//     ] = await db
//       .promise()
//       .query('SELECT id FROM intern WHERE id = ?', [internId])

//     if (rows.length === 0) {
//       return res
//         .status(404)
//         .json({ status: false, message: 'intern data Not Found' })
//     }

//     // 2. Update deals di database
//     await db
//       .promise()
//       .query(
//         'UPDATE intern SET nama = ? , nim = ? , jurusan = ? , ipk = ? , cv = ?,           lamaran = ? , ktp = ?, krrs = ? WHERE id = ?',
//         [nama, nim, fakultas, jurusan, ipkValue, cv, lamaran, ktp, krrs, internId],
//       )

//     return res.status(200).json({
//       status: true,
//       message: 'Success Update the internship',
//     })
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: 'Terjadi kesalahan pada server',
//       error: error.message, // Tambahkan pesan error ke respons
//     })
//   }
// }
exports.uDIntern = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({
      status: false,
      message: 'No file detected',
    });
  }

  const { nama, nim, fakultas, jurusan, ipk } = req.body;

  let cv = req.files.cv ? `/cv/${req.files.cv[0].filename}` : null;
  let lamaran = req.files.lamaran ? `/lamaran/${req.files.lamaran[0].filename}` : null;
  let ktp = req.files.ktp ? `/identitas/${req.files.ktp[0].filename}` : null;
  let krrs = req.files.krrs ? `/krrs/${req.files.krrs[0].filename}` : null;

  const internId = req.params.id;

  if (!cv || !lamaran || !ktp || !krrs) {
    return res.status(400).send({
      status: false,
      message: 'All required files (cv, lamaran, ktp, krrs) must be uploaded',
    });
  }

  const ipkValue = parseFloat(ipk);
  if (isNaN(ipkValue)) {
    return res.status(400).json({
      status: false,
      message: 'IPK harus berupa angka yang valid',
    });
  }

  try {
    // Cek apakah data internship ada
    const [rows] = await db.promise().query('SELECT id FROM intern WHERE id = ?', [internId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Intern data Not Found',
      });
    }

    // console.log({
    //   nama, nim, fakultas, jurusan, ipk: ipkValue, cv, lamaran, ktp, krrs, internId
    // });

    await db.promise().query(
      `UPDATE intern SET nama = ?, nim = ?, fakultas = ?, jurusan = ?, ipk = ?, 
       cv = ?, lamaran = ?, ktp = ?, krrs = ? WHERE id = ?`,
      [nama, nim, fakultas, jurusan, ipkValue, cv, lamaran, ktp, krrs, internId]
    );

    return res.status(200).json({
      status: true,
      message: 'Success Update the internship',
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


exports.delDIntern = async (req, res, next) => {
  const internId = req.params.id
  try {
    // 1. Ambil deals dari database
    const [
      rows,
    ] = await db
      .promise()
      .query('SELECT id FROM intern WHERE id = ?', [internId])

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'internship data Not Found' })
    }
    // 2. delete deals di database
    await db.promise().query('DELETE FROM intern WHERE id = ?', [internId])

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
