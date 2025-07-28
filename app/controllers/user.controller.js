const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db/db.js')
const moment = require('moment')
require('dotenv').config()
const env = process.env

async function GetPageCount() {
  return new Promise((resolve) => {
    db.query(`SELECT COUNT (*) Page_Count FROM users`, (err, result) => {
      resolve(result[0].Page_Count)
    })
  })
}
exports.getusers = async (req, res, next) => {
  const {
    query: { search, currentPage, pageSize },
  } = req
  const keyword = search ? `%${search}%` : search
  let limit = Number(pageSize) || 10
  let current_Page = currentPage || 1
  let offset = current_Page - 1
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
    SELECT u.id,nim, fakultas, prodi, first_name , last_name ,email, role_id, namarole.nama AS rolename ,registered FROM users u JOIN namarole ON u.role_id = namarole.id `
  if (keyword) {
    query += `AND (nim LIKE :keyword OR code LIKE :keyword `
    query += `OR first_name LIKE :keyword) `
  }
  query += ` ORDER BY id DESC limit ${limit} offset ${offset * limit}`
  db.query(query, (err, result) => {
    if (err) {
      return res.status(400).send({
        status: false,
        message: err,
      })
    } else {
      return res.status(200).send({
        status: true,
        data: result,
        meta: {
          currentPage: Number(current_Page),
          TotalPage: Math.ceil(PageCount / limit),
          pageSize: limit,
        },
      })
    }
  })
}

exports.getuser = async (req, res, next) => {
  const userId = req.params.id
  const query =
    'SELECT u.id, nim, fakultas, prodi, first_name , last_name ,email,role_id ,image, namarole.nama AS rolename FROM users u JOIN namarole ON u.role_id = namarole.id WHERE u.id = ?'
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
        message: 'Pengguna tidak ditemukan',
      })
    }
    const user = results[0]
    return res.status(200).json({
      status: true,
      message: 'Data pengguna berhasil ditemukan',
      users: {
        id: user.id,
        nim: user.nim,
        fakultas: user.fakultas,
        prodi: user.prodi,
        nama: user.first_name + ' ' + user.last_name,
        email: user.email,
        image: user.image,
        role: user.rolename,
      },
    })
  })
}

exports.signup = async (req, res, next) => {
  const {
    nim,
    fakultas,
    prodi,
    first_name,
    last_name,
    email,
    password,
  } = req.body
  db.query(
    `SELECT id FROM users WHERE LOWER(email) = LOWER('${email}');`,
    (err, result) => {
      if (err) {
        return res.status(409).send({
          status : false,
          message: err,
        })
      }
      if (result.length) {
        return res.status(400).send({
          status: false,
          message: 'This email is already in use',
        })
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              message: err,
            })
          } else {
            const userQuery = `INSERT INTO users (nim, fakultas, prodi, first_name, last_name, email, role_id, password, image, registered, verify) VALUES (?,?, ?,?, ?, ?, 5, ?, '/pp/default.jpg',now(), ?)`
            const userValues = [
              nim,
              fakultas,
              prodi,
              first_name,
              last_name,
              email,
              hash,
              false,
            ]
            db.query(userQuery, userValues, (err, result) => {
              if (err) {
                return res.status(400).send({ status: false, message: err })
              }
              return res.status(201).send({
                status: true,
                message: `Registered`,
              })
            })
          }
        })
      }
    },
  )
}

// exports.login = (req, res, next) => {
//   db.query(
//     `SELECT id, nim, role_id, email, password FROM users WHERE email = ${db.escape(
//       req.body.email,
//     )};`,
//     (errA, result) => {
//       if (errA) {
//         return res.status(400).send({
//           status: false,
//           message: errA,
//         })
//       }
//       if (!result.length) {
//         return res.status(400).send({
//           status: false,
//           message: 'email incorrect',
//         })
//       }
//       bcrypt.compare(req.body.password, result[0].password, (bErr, bResult) => {
//         if (bErr) {
//           return res.status(400).send({
//             status: false,
//             message: 'password incorrect',
//           })
//         }
//         if (bResult) {
//           const token = jwt.sign(
//             {
//               email: result[0].email,
//               userId: result[0].id,
//               role: result[0].role_id,
//             },
//             'SECRETKEY',
//             { expiresIn: '1 days' },
//           )
//           return db.query(
//             `SELECT u.id, nim,first_name, last_name ,email, role_id, namarole.nama AS rolename FROM users u JOIN namarole ON u.role_id = namarole.id WHERE u.id = '${result[0].id}'GROUP BY u.id`,
//             async (err, resultC) => {
//               if (err) {
//                 return res.status(400).send({
//                   status: false,
//                   message: err,
//                 })
//               } else if (
//                 resultC[0].role_id == '1' ||
//                 resultC[0].role_id == '2' ||
//                 resultC[0].role_id == '3' ||
//                 resultC[0].role_id == '4' ||
//                 resultC[0].role_id == '5' 

//               ) {
//                 // let promise = new Promise((resolve, reject) => {
//                 //   audit(result[0].id, `Logged in`, resolve)
//                 // })
//                 // let aud_res = await promise

//                 if (resultC) {
//                   //  let url = req.url
//                   // console.log(url);
//                   let Akses = await getAccess(resultC[0].role_id)
//                   let AksesProfil = await getAccessMenus(resultC[0].role_id)
//                   // console.log(Akses);
//                   res.status(200).send({
//                     status: true,
//                     message: `Logged in as ${resultC[0].rolename}!`,
//                     token: `${resultC[0].role_id} ${token}`,
//                     users: {
//                       id: resultC[0].id,
//                       nim: resultC[0].nim,
//                       nama: resultC[0].first_name + ' ' + resultC[0].last_name,
//                       email: resultC[0].email,
//                       role_id : resultC[0].role_id,
//                       role: resultC[0].rolename,
//                       // url
//                     },
//                     Akses,
//                     AksesProfil,
//                   })
//                 } else {
//                   return res.status(400).send({
//                     status: false,
//                     message: 'Error Invalid User',
//                   })
//                 }
//               } else {
//                 return res.status(500).send({
//                   status: false,
//                   message:
//                     'Status on account is abnormal, please report this issue to the staff',
//                 })
//               }
//             },
//           )
//         }
//         return res.status(400).send({
//           status: false,
//           message: 'Username or password incorrect',
//         })
//       })
//     },
//   )
// }

exports.login = (req, res, next) => {
  db.query(
    `SELECT id, nim, role_id, email, password, failed_attempts, last_failed_login,verify FROM users WHERE email = ${db.escape(req.body.email)};`,
    (errA, result) => {
      if (errA) {
        return res.status(400).send({ status: false, message: errA });
      }

      if (!result.length) {
        return res.status(400).send({ status: false, message: 'email incorrect' });
      }

      const user = result[0];
      const now = moment();
      const lastFailed = moment(user.last_failed_login);
      const attempts = user.failed_attempts;
      
      if (!user.verify) {
      return res.status(403).send({
        status: false,
        message: 'Please verify your email before logging in.',
      });
    }

      if (attempts >= 5) {
        const waitTime = 5 * Math.floor(attempts / 5);
        const unlockTime = lastFailed.add(waitTime, 'minutes');
        if (now.isBefore(unlockTime)) {
          const remaining = unlockTime.diff(now, 'minutes');
          return res.status(403).send({
            status: false,
            message: `Too many failed attempts. Please try again in ${remaining} minute(s).`,
          });
        }
      }

      bcrypt.compare(req.body.password, user.password, async (bErr, bResult) => {
        if (bErr || !bResult) {
          db.query(
            `UPDATE users SET failed_attempts = failed_attempts + 1, last_failed_login = NOW() WHERE id = ?`,
            [user.id]
          );
          return res.status(400).send({
            status: false,
            message: 'Password incorrect',
          });
        }

        db.query(
          `UPDATE users SET failed_attempts = 0, last_failed_login = NULL WHERE id = ?`,
          [user.id]
        );

        const token = jwt.sign(
          {
            email: user.email,
            userId: user.id,
            role: user.role_id,
          },
          env.JWT_Sect,
          { expiresIn: '1 days' }
        );

        db.query(
          `SELECT u.id, nim,first_name, last_name ,email, role_id, namarole.nama AS rolename 
           FROM users u 
           JOIN namarole ON u.role_id = namarole.id 
           WHERE u.id = '${user.id}' 
           GROUP BY u.id`,
          async (err, resultC) => {
            if (err) {
              return res.status(400).send({ status: false, message: err });
            }

            if (['1', '2', '3', '4', '5'].includes(resultC[0].role_id.toString())) {
              let Akses = await getAccess(resultC[0].role_id);
              let AksesProfil = await getAccessMenus(resultC[0].role_id);

              res.status(200).send({
                status: true,
                message: `Logged in as ${resultC[0].rolename}!`,
                token: `${resultC[0].role_id} ${token}`,
                users: {
                  id: resultC[0].id,
                  nim: resultC[0].nim,
                  nama: resultC[0].first_name + ' ' + resultC[0].last_name,
                  email: resultC[0].email,
                  role_id: resultC[0].role_id,
                  role: resultC[0].rolename,
                },
                Akses,
                AksesProfil,
              });
            } else {
              return res.status(500).send({
                status: false,
                message: 'Status on account is abnormal, please report this issue to the staff',
              });
            }
          }
        );
      });
    }
  );
};

function getAccess(id) {
  return new Promise((resolve) => {
    db.query(
      `SELECT menu_id, m.nama AS menu, m.url AS url,ijin FROM akses a JOIN menu m ON a.menu_id = m.id WHERE role_id = '${id}'`,
      (err, result) => {
        if (err) {
          resolve([])
          return
        }
        let k = resolve(result)
      },
    )
  })
}

function getAccessMenus(id) {
  return new Promise((resolve) => {
    db.query(
      `SELECT menus_id, m.nama AS menus, ijin FROM aksesprofil a JOIN menus m ON a.menus_id = m.id WHERE role_id = '${id}'`,
      (err, result) => {
        if (err) {
          resolve([])
          return
        }
        let k = resolve(result)

        // resolve(JSON.stringify(result).split(","))
      },
    )
  })
}

exports.testapi = async (req, res, next) => {
  res.send('wak haji doyok')
}

exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body
  const userId = req.params.id

  try {
    const [
      rows,
    ] = await db
      .promise()
      .query('SELECT password FROM users WHERE id = ?', [userId])

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'User tidak ditemukan' })
    }
    const storedPassword = rows[0].password
    const isMatch = await bcrypt.compare(old_password, storedPassword)
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, message: 'Password lama salah' })
    }
    const hashedPassword = await bcrypt.hash(new_password, 10)
    await db
      .promise()
      .query('UPDATE users SET password = ? WHERE id = ?', [
        hashedPassword,
        userId,
      ])

    return res.status(200).json({
      status: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
    })
  }
}

exports.upict = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({
      status: false,
      message: 'No file detected',
    })
  }
  let Url = req.files.profile ? `/pp/${req.files.profile[0].filename}` : null
  db.query(
    `UPDATE users SET image = ${db.escape(Url)} WHERE id = '${req.params.id}'`,
    (err) => {
      if (err) {
        return res.status(400).send({
          status: false,
          message: err,
        })
      }
      return res.status(201).send({
        status: true,
        message: 'Successfully updated',
      })
    },
  )
}
