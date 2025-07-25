const transporter = require("../module/mail.js");
const connection = require("../db/db.js");
const config = require('../../config');



function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  connection.query('DELETE FROM otps WHERE email = ?', [email]);

  connection.query(
    'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)',
    [email, otp, expiresAt],
    async (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      try {
        await transporter.sendMail({
          from: `"UntarX Team" <${config.mail.user}>`,
          to: email,
          subject: "Your OTP Verification Code",
          html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
        });

        res.status(200).json({ message: "OTP sent successfully" });
      } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP" });
      }
    }
  );
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  connection.query(
    'SELECT * FROM otps WHERE email = ? AND otp = ? LIMIT 1',
    [email, otp],
    (err, results) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(400).json({ verified: false, error: "Invalid OTP" });
      }

      const otpRecord = results[0];
      const now = new Date();

      if (new Date(otpRecord.expires_at) < now) {
        return res.status(400).json({ verified: false, error: "OTP expired" });
      }

      connection.query('DELETE FROM otps WHERE email = ?', [email], (deleteErr) => {
        if (deleteErr) {
          console.error("Delete OTP Error:", deleteErr);
          return res.status(500).json({ error: "Failed to delete OTP" });
        }

        connection.query(
          'UPDATE users SET verify = true WHERE email = ?',
          [email],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("Update User Error:", updateErr);
              return res.status(500).json({ error: "Failed to update user status" });
            }

            return res.status(200).json({ verified: true });
          }
        );
      });
    }
  );
};