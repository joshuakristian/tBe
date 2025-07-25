require('dotenv').config()
const env = process.env

const config = {

  mail: {
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    user: env.MAIL_USER,
    password: env.MAIL_PASSWORD,
  },
}
module.exports = config