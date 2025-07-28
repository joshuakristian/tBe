const jwt = require('jsonwebtoken')
const Joi = require('joi')
const validateRequest = require('../validation/validate.js')

function validateRegister(req, res, next) {
  const schema = Joi.object({
    nim: Joi.number().required(),
    fakultas: Joi.string().required(),
    prodi: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .required()
      .min(6)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*,./])'))
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one number, and one special character',
      }),
    password_repeat: Joi.string().valid(Joi.ref('password')).required(),
  })
  validateRequest(req, res, next, schema)
}

function validatePw(req, res, next) {
  const schema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string()
      .required()
      .min(6)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*,./])'))
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one number, and one special character !@#$%^&*,./',
      }),
    new_password_repeat: Joi.string().valid(Joi.ref('new_password')).required(),
  })
  validateRequest(req, res, next, schema)
}

function rpw(req, res, next) {
  const schema = Joi.object({
    new_password: Joi.string()
      .required()
      .min(6)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*,./])'))
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one number, and one special character !@#$%^&*,./',
      }),
    new_password_repeat: Joi.string().valid(Joi.ref('new_password')).required(),
  })
  validateRequest(req, res, next, schema)
}

function isLogin(req, res, next) {
  // console.log(req.headers.authorization)
  if (!req.headers.authorization) {
    return res.status(400).send({
      message: 'Your session is not valid!',
    })
  }
  try {
    const authHeader = req.headers.authorization
    const role = authHeader.split(' ')[1]
    const token = authHeader.split(' ')[2]
    const decoded = jwt.verify(token, 'SECRETKEY')
    if (!['1', '2', '3', '4', '5'].includes(role)) {
      return res.status(403).send('not allowed')
    }
    // console.log(decoded)
    req.users = decoded
    next()
  } catch (err) {
    return res.status(400).send({
      message: 'Your session is not valid!',
    })
  }
}

function validateNE(req, res, next) {
  const schema = Joi.object({
    namaEvent: Joi.string().required(),
    penyelenggara: Joi.string().required(),
    lokasi: Joi.string().required(),
    deskripsi: Joi.string().required(),
    kategori: Joi.string().required(),
    tgl_m: Joi.date().required(),
    tgl_a: Joi.date().greater('now').required(),
    jam_m: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    jam_a: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    link: Joi.string().required(),
  })
  validateRequest(req, res, next, schema)
}

function validateNForm(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    questions: Joi.string().required(),
    createdAt: Joi.string().required(),
  })
  validateRequest(req, res, next, schema)
}

function validateND(req, res, next) {
  const schema = Joi.object({
    dealsName: Joi.string().required(),
    deskripsi: Joi.string().required(),
    kategori: Joi.string().required(),
    tgl_m: Joi.date().required(),
    tgl_a: Joi.date().greater('now').required(),
    jam_m: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    jam_a: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    namaToko: Joi.string().required(),
  })
  validateRequest(req, res, next, schema)
}

function validateInt(req, res, next) {
  const schema = Joi.object({
    nama: Joi.string().required(),
    nim: Joi.number().required(),
    fakultas: Joi.string().required(),
    jurusan: Joi.string().required(),
    ipk: Joi.number().required(),
  })
  validateRequest(req, res, next, schema)
}

function validateRegistIntern(req, res, next) {
  const schema = Joi.object({
    judul: Joi.string().required(),
    jabatan: Joi.string().required(),
    perusahaan: Joi.string().required(),
    detailPerusahaan: Joi.string().required(),
    deskripsiPekerjaan: Joi.string().required(),
    tgl_m: Joi.date().required(),
    tgl_a: Joi.date().greater('now').required(),
    jam_m: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    jam_a: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    lokasi: Joi.string().required(),
  })
  validateRequest(req, res, next, schema)
}
function validateEditIntern(req, res, next) {
  const schema = Joi.object({
    judul: Joi.string().required(),
    jabatan: Joi.string().required(),
    perusahaan: Joi.string().required(),
    detailPerusahaan: Joi.string().required(),
    deskripsiPekerjaan: Joi.string().required(),
    tgl_m: Joi.date().required(),
    tgl_a: Joi.date().required(),
    jam_m: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    jam_a: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    lokasi: Joi.string().required(),
  })
  validateRequest(req, res, next, schema)
}

function validateNR(req, res, next) {
  const schema = Joi.object({
    eventId: Joi.number().required(),
    userId: Joi.number().required(),
    answers: Joi.alternatives().try(
      Joi.object(),
      Joi.array().items(Joi.object()),
      Joi.string()
    ).required(),
  })
  validateRequest(req, res, next, schema)
}

function validateNF(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    questions: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.object())
    ).required(),
    createdAt: Joi.string().required(),
  })
  validateRequest(req, res, next, schema)
}

module.exports.validateNF = validateNF
module.exports.validateNR = validateNR
module.exports.validateRegister = validateRegister
module.exports.validateLogin = isLogin
module.exports.validatePw = validatePw
module.exports.validateRPw = rpw
module.exports.validateNEvent = validateNE
module.exports.validateNF = validateNForm
module.exports.validateNDeals = validateND
module.exports.validateIntern = validateInt
module.exports.validateRegistIntern = validateRegistIntern
module.exports.validateEIntern = validateEditIntern
