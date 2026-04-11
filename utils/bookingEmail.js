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

const APP_BRAND = {
  name: 'CLUB 1917',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@golfbooking.com',
  supportPhone: process.env.SUPPORT_PHONE || '+977-9800000000',
};

const buildBookingEmailHtml = ({
  title,
  intro,
  fullName,
  bookingType,
  serviceName,
  slot,
  paymentMethod,
  totalAmount,
  advanceAmount,
  showPayment,
}) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#eef1ea;font-family:Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-radius:16px;overflow:hidden;border:1px solid #d9dfd4;background:#ffffff;">
            <tr>
              <td style="padding:18px 24px;background:linear-gradient(90deg,#1f3529,#2f4c39);">
                <div style="font-size:34px;line-height:34px;letter-spacing:1px;font-weight:700;color:#e7d5b8;">CLUB</div>
                <div style="font-size:24px;line-height:24px;letter-spacing:3px;font-weight:700;color:#c69a63;">1917</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 24px 18px;">
                <h2 style="margin:0 0 8px;font-size:28px;line-height:30px;color:#1f3529;">${title}</h2>
                <p style="margin:0 0 14px;font-size:16px;line-height:24px;color:#3a433c;">Hello ${fullName || 'Golfer'},</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#4b554d;">${intro}</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dbe3d7;border-radius:12px;overflow:hidden;background:#f7f9f4;">
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #dbe3d7;font-size:14px;color:#3f4b42;"><strong style="display:inline-block;min-width:126px;color:#1f3529;">Booking Type:</strong> ${bookingType}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #dbe3d7;font-size:14px;color:#3f4b42;"><strong style="display:inline-block;min-width:126px;color:#1f3529;">Service:</strong> ${serviceName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;${showPayment ? 'border-bottom:1px solid #dbe3d7;' : ''}font-size:14px;color:#3f4b42;"><strong style="display:inline-block;min-width:126px;color:#1f3529;">Slot:</strong> ${slot}</td>
                  </tr>
                  ${showPayment ? `
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #dbe3d7;font-size:14px;color:#3f4b42;"><strong style="display:inline-block;min-width:126px;color:#1f3529;">Payment:</strong> ${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #dbe3d7;font-size:14px;color:#3f4b42;"><strong style="display:inline-block;min-width:126px;color:#1f3529;">Advance Paid:</strong> ${formatCurrency(advanceAmount)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;font-size:14px;color:#3f4b42;"><strong style="display:inline-block;min-width:126px;color:#1f3529;">Total Amount:</strong> ${formatCurrency(totalAmount)}</td>
                  </tr>` : ''}
                </table>

                <div style="margin-top:18px;padding:14px 16px;border-radius:12px;background:#f2f6ec;border:1px solid #dbe3d7;">
                  <div style="font-size:13px;line-height:20px;color:#4f5a52;"><strong style="color:#1f3529;">Need help?</strong></div>
                  <div style="font-size:13px;line-height:20px;color:#4f5a52;">Email: ${APP_BRAND.supportEmail}</div>
                  <div style="font-size:13px;line-height:20px;color:#4f5a52;">Contact: ${APP_BRAND.supportPhone}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px;background:#1f3529;color:#d2dbc9;font-size:12px;line-height:18px;">
                ${APP_BRAND.name} • Official Booking Desk
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

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

  const html = buildBookingEmailHtml({
    title: 'Booking Confirmed',
    intro: 'Your booking is confirmed. We look forward to seeing you on course.',
    fullName,
    bookingType,
    serviceName,
    slot: formattedSlot,
    paymentMethod,
    totalAmount,
    advanceAmount,
    showPayment: true,
  });

  await transporter.sendMail({
    from: '"Golf Booking System" <no-reply@golfbooking.com>',
    to: email,
    subject,
    text,
    html,
  });
};

const sendBookingCancellationEmail = async ({
  email,
  fullName,
  bookingType,
  serviceName,
  slot,
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

  const subject = 'Booking Cancelled';
  const text = [
    `Hello ${fullName || 'Golfer'},`,
    '',
    'Your booking has been cancelled successfully.',
    `Booking type: ${bookingType}`,
    `Service: ${serviceName}`,
    `Slot: ${formattedSlot}`,
  ].join('\n');

  const html = buildBookingEmailHtml({
    title: 'Booking Cancelled',
    intro: 'Your booking has been cancelled successfully. You can book another slot anytime from the app.',
    fullName,
    bookingType,
    serviceName,
    slot: formattedSlot,
    paymentMethod: '-',
    totalAmount: 0,
    advanceAmount: 0,
    showPayment: false,
  });

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
  sendBookingCancellationEmail,
};
