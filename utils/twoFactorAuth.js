const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

// Generate 2FA secret
const generateSecret = () => {
  return speakeasy.generateSecret({ length: 20 }).base32;
};

// Verify 2FA token
const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1, // Allow 1 token before or after current time
  });
};

// Send 2FA email
const sendTwoFactorEmail = async (email, token) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const supportEmail = process.env.SUPPORT_EMAIL || 'support@golfbooking.com';

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Golf Booking System" <no-reply@golfbooking.com>', // sender address
    to: email, // list of receivers
    subject: 'Your 2FA Code', // Subject line
    text: `Your two-factor authentication code is: ${token}`, // plain text body
    html: `
      <div style="margin:0;padding:24px;background:#eef1ea;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid #d9dfd4;background:#fff;">
          <div style="padding:16px 22px;background:linear-gradient(90deg,#1f3529,#2f4c39);">
            <div style="font-size:30px;line-height:30px;letter-spacing:1px;font-weight:700;color:#e7d5b8;">CLUB</div>
            <div style="font-size:22px;line-height:22px;letter-spacing:3px;font-weight:700;color:#c69a63;">1917</div>
          </div>

          <div style="padding:22px;">
            <h2 style="margin:0 0 8px;color:#1f3529;font-size:28px;line-height:30px;">Two-Factor Verification</h2>
            <p style="margin:0 0 16px;color:#4b554d;font-size:15px;line-height:24px;">Use the code below to complete your sign in. Do not share this code with anyone.</p>

            <div style="margin:0 0 16px;padding:16px;border:1px solid #d6e1d1;border-radius:12px;background:#f3f7eb;text-align:center;">
              <div style="font-size:38px;line-height:42px;letter-spacing:8px;font-weight:700;color:#2f4c39;">${token}</div>
            </div>

            <p style="margin:0;color:#5a665d;font-size:13px;line-height:20px;">This code expires shortly. If you did not request this login, please contact us at ${supportEmail}.</p>
          </div>

          <div style="padding:12px 22px;background:#1f3529;color:#d2dbc9;font-size:12px;line-height:18px;">
            CLUB 1917 • Security Mailer
          </div>
        </div>
      </div>
    `, // html body
  });

  console.log('2FA Message sent: %s', info.messageId);
};

module.exports = {
  generateSecret,
  verifyToken,
  sendTwoFactorEmail,
};
