const transporter = require("../module/mail.js");
const connection = require("../db/db.js");
const config = require('../../config');
const crypto = require('crypto');

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

const SECRET_KEY = 't2Gk9XcL8wVbZ1rMfQsY6pNdA4EyJu0B';
const IV_LENGTH = 16;

const encryptUserData = (userData) => {
  try {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(SECRET_KEY), iv);
    
    let encrypted = cipher.update(JSON.stringify(userData), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const result = iv.toString('hex') + ':' + encrypted;
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

const decryptUserData = (encryptedData) => {
  try {
    const algorithm = 'aes-256-cbc';
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(SECRET_KEY), iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

exports.requestResetPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(200).json({ message: "If email exists, reset link has been sent" });
    }

    const user = results[0];
    const payload = {
      email: user.email,
      userId: user.id,
      requestId: generateToken(),
      timestamp: Date.now()
    };

    const encryptedToken = encryptUserData(payload);
    
    if (!encryptedToken) {
      return res.status(500).json({ error: "Failed to generate reset link" });
    }

    const resetLink = `${process.env.URL}/reset-password?token=${encodeURIComponent(encryptedToken)}`;

    try {
      await transporter.sendMail({
        from: `"Your App" <${config.mail.user}>`,
        to: email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p><strong>This link will expire in 10 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      res.status(200).json({ message: "Reset link sent successfully" });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send reset link" });
    }
  });
};

// RESET PASSWORD (Tanpa cek token di DB)
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  try {
    // Decrypt token dari URL
    const decryptedData = decryptUserData(token);
    
    if (!decryptedData) {
      return res.status(400).json({ error: "Invalid reset link" });
    }

    // Cek apakah link expired (10 menit)
    const now = Date.now();
    const tenMinutesInMillis = 10 * 60 * 1000;
    if (now - decryptedData.timestamp > tenMinutesInMillis) {
      return res.status(400).json({ error: "Reset link has expired" });
    }

    // Hash password baru
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password di database
    connection.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, decryptedData.userId],
      (err, result) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ 
          success: true,
          message: "Password has been reset successfully" 
        });
      }
    );

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};