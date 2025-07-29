const transporter = require("../module/mail.js");
const connection = require("../db/db.js");
const config = require('../../config');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>OTP Verification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: -0.5px;">
                    UntarX
                  </h1>
                  <p style="margin: 8px 0 0 0; color: #e2e8f0; font-size: 16px; opacity: 0.9;">
                    Email Verification
                  </p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; font-weight: 600;">
                    Verify Your Email Address
                  </h2>
                  
                  <p style="margin: 0 0 25px 0; color: #4a5568; font-size: 16px;">
                    Hello! We received a request to verify your email address. Please use the verification code below to complete the process.
                  </p>

                  <!-- OTP Box -->
                  <div style="background-color: #f7fafc; border: 2px dashed #cbd5e0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0 0 15px 0; color: #718096; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Your Verification Code
                    </p>
                    <div style="font-size: 36px; font-weight: 700; color: #2d3748; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0;">
                      ${otp}
                    </div>
                    <p style="margin: 15px 0 0 0; color: #e53e3e; font-size: 14px; font-weight: 500;">
                      ⏰ Expires in 5 minutes
                    </p>
                  </div>

                  <div style="background-color: #edf2f7; border-left: 4px solid #4299e1; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                    <p style="margin: 0; color: #2d3748; font-size: 14px;">
                      <strong>Security Note:</strong> This code is valid for 5 minutes only. If you didn't request this verification, please ignore this email or contact our support team.
                    </p>
                  </div>

                  <p style="margin: 25px 0 0 0; color: #718096; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:enterprise@untarx.com" style="color: #4299e1; text-decoration: none;">enterprise@untarx.com</a>
                  </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #2d3748; padding: 25px 30px; text-align: center;">
                  <p style="margin: 0; color: #a0aec0; font-size: 14px;">
                    © 2025 UntarX Team. All rights reserved.
                  </p>
                  <p style="margin: 8px 0 0 0; color: #718096; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
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

// Helper function to load HTML templates
const loadTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
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

    const resetLink = `${process.env.URL}/api/reset-password?token=${encodeURIComponent(encryptedToken)}`;

    try {
      await transporter.sendMail({
        from: `"UntarX Team" <${config.mail.user}>`,
        to: email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                style="background-color: #007bff; color: #fff; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${resetLink}" style="color: #007bff;">${resetLink}</a></p>
            <p><strong>This link will expire in 10 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });

      res.status(200).json({ message: "Reset link sent successfully" });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send reset link" });
    }
  });
};

exports.rpw = async (req, res) => {
  const { token, newPassword, newPasswordRepeat } = req.body;
    
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  if (newPassword !== newPasswordRepeat) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const decryptedData = decryptUserData(token);
    
    if (!decryptedData) {
      return res.status(400).json({ error: "Invalid reset link" });
    }

    const now = Date.now();
    const tenMinutesInMillis = 10 * 60 * 1000;
    if (now - decryptedData.timestamp > tenMinutesInMillis) {
      return res.status(400).json({ error: "Reset link has expired" });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

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

        // Load and send success template
        const successTemplate = loadTemplate('reset-success');
        if (successTemplate) {
          res.status(200).send(successTemplate);
        } else {
          // Fallback if template loading fails
          res.status(200).json({ 
            success: true,
            message: "Password has been reset successfully" 
          });
        }
      }
    );

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

exports.getResetPassword = (req, res) => {
  const { token } = req.query;

  if (!token) {
    const errorTemplate = loadTemplate('invalid-link');
    if (errorTemplate) {
      return res.status(400).send(errorTemplate);
    }
    return res.status(400).json({ error: "Invalid reset link" });
  }

  // Check if token is expired before showing the form
  try {
    const decryptedData = decryptUserData(token);
    
    if (!decryptedData) {
      const errorTemplate = loadTemplate('invalid-link');
      if (errorTemplate) {
        return res.status(400).send(errorTemplate);
      }
      return res.status(400).json({ error: "Invalid reset link" });
    }

    const now = Date.now();
    const tenMinutesInMillis = 10 * 60 * 1000;
    if (now - decryptedData.timestamp > tenMinutesInMillis) {
      const expiredTemplate = loadTemplate('expired-link');
      if (expiredTemplate) {
        return res.status(400).send(expiredTemplate);
      }
      return res.status(400).json({ error: "Reset link has expired" });
    }
  } catch (error) {
    const errorTemplate = loadTemplate('invalid-link');
    if (errorTemplate) {
      return res.status(400).send(errorTemplate);
    }
    return res.status(400).json({ error: "Invalid reset link" });
  }

  // Load and send reset form template
  const resetFormTemplate = loadTemplate('reset-form');
  if (resetFormTemplate) {
    const populatedTemplate = resetFormTemplate.replace('{{TOKEN}}', token);
    res.send(populatedTemplate);
  } else {
    // Fallback if template loading fails
    res.status(500).json({ error: "Template loading error" });
  }
};