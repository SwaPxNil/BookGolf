const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toFixed(2)}`;

const sendBookingConfirmationEmail = async ({
  email,
  fullName,
  bookingType,
  serviceName,
  slot,
  paymentMethod,
  totalAmount,
  advanceAmount,
}) => {
  if (!email) {
    return;
  }

  const transporter = createTransporter();
  const formattedSlot = slot
    ? new Date(slot).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'To be confirmed';

  const subject = 'Booking Confirmed';
  const text = [
    `Hello ${fullName || 'Golfer'},`,
    '',
    'Your booking has been confirmed.',
    `Booking type: ${bookingType}`,
    `Service: ${serviceName}`,
    `Slot: ${formattedSlot}`,
    `Payment method: ${paymentMethod}`,
    `Advance paid: ${formatCurrency(advanceAmount)}`,
    `Total amount: ${formatCurrency(totalAmount)}`,
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2933;">
      <h2>Booking Confirmed</h2>
      <p>Hello ${fullName || 'Golfer'},</p>
      <p>Your booking has been confirmed.</p>
      <p><strong>Booking type:</strong> ${bookingType}</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Slot:</strong> ${formattedSlot}</p>
      <p><strong>Payment method:</strong> ${paymentMethod}</p>
      <p><strong>Advance paid:</strong> ${formatCurrency(advanceAmount)}</p>
      <p><strong>Total amount:</strong> ${formatCurrency(totalAmount)}</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Golf Booking System" <no-reply@golfbooking.com>',
    to: email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendBookingConfirmationEmail,
};
