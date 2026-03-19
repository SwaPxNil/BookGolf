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

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Golf Booking System" <no-reply@golfbooking.com>', // sender address
    to: email, // list of receivers
    subject: 'Your 2FA Code', // Subject line
    text: `Your two-factor authentication code is: ${token}`, // plain text body
    html: `<b>Your two-factor authentication code is: ${token}</b>`, // html body
  });

  console.log('2FA Message sent: %s', info.messageId);
};

module.exports = {
  generateSecret,
  verifyToken,
  sendTwoFactorEmail,
};
