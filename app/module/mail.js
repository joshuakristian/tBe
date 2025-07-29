const nodemailer = require("nodemailer");

let config;
try {
  config = require('../../config');
} catch (e) {
  console.log('No config file found');
  process.exit(0);
}

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: true,
    auth: {
      user: config.mail.user,
      pass: config.mail.password,
    },

});

module.exports = transporter;