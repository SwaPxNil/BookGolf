const paymentService = require('../services/paymentService');
const bookingPaymentService = require('../services/bookingPaymentService');

const resolveCallbackBaseUrl = (req) => {
  const envBase = String(process.env.PAYMENT_CALLBACK_BASE_URL || '').trim();
  const requestBase = `${req.protocol}://${req.get('host')}`;
  const isLocalhostBase = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envBase);

  // If env uses localhost but the request comes from LAN/IP, prefer the request host.
  // This avoids mobile Safari redirect failures where localhost points to the phone itself.
  if (envBase && isLocalhostBase) {
    return requestBase;
  }

  if (envBase) {
    return envBase;
  }

  return requestBase;
};

// @desc    Get user's payments
// @route   GET /api/payments/me
// @access  Private (USER)
const getUserPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getUserPayments(req.user.id);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Process advance payment and confirm booking
// @route   POST /api/payments/bookings/advance
// @access  Private (USER)
const processAdvanceBookingPayment = async (req, res, next) => {
  try {
    const result = await bookingPaymentService.processAdvanceBookingPayment(req.user, req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Initiate advance payment for booking
// @route   POST /api/payments/bookings/advance/initiate
// @access  Private (USER)
const initiateAdvanceBookingPayment = async (req, res, next) => {
  try {
    const callbackBaseUrl = resolveCallbackBaseUrl(req);
    const result = await bookingPaymentService.initiateAdvanceBookingPayment(req.user, req.body, {
      callbackBaseUrl,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify eSewa payment and finalize booking
// @route   POST /api/payments/esewa/verify
// @access  Private (USER)
const verifyEsewaPayment = async (req, res, next) => {
  try {
    const result = await bookingPaymentService.verifyEsewaAdvancePayment(req.user, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Khalti payment and finalize booking
// @route   POST /api/payments/khalti/verify
// @access  Private (USER)
const verifyKhaltiPayment = async (req, res, next) => {
  try {
    const result = await bookingPaymentService.verifyKhaltiAdvancePayment(req.user, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Render eSewa auto-submit checkout form
// @route   GET /api/payments/esewa/checkout/:paymentId
// @access  Public
const renderEsewaCheckoutPage = async (req, res, next) => {
  try {
    const html = await bookingPaymentService.getEsewaCheckoutPage(req.params.paymentId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

// @desc    Capture eSewa success redirect payload
// @route   GET /api/payments/esewa/success
// @access  Public
const handleEsewaSuccessRedirect = async (req, res, next) => {
  try {
    const paymentId = req.params.paymentId || req.query.paymentId;
    const data = req.query.data;

    await bookingPaymentService.captureEsewaRedirectData({
      paymentId,
      data,
      status: 'SUCCESS',
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send('<html><body style="font-family:Arial;padding:20px;"><h2>eSewa payment received</h2><p>You can now return to the app and tap verify payment.</p></body></html>');
  } catch (err) {
    next(err);
  }
};

// @desc    Capture eSewa failure redirect
// @route   GET /api/payments/esewa/failure
// @access  Public
const handleEsewaFailureRedirect = async (req, res, next) => {
  try {
    const paymentId = req.params.paymentId || req.query.paymentId;
    const data = req.query.data;

    await bookingPaymentService.captureEsewaRedirectData({
      paymentId,
      data,
      status: 'FAILED',
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send('<html><body style="font-family:Arial;padding:20px;"><h2>eSewa payment failed</h2><p>Please return to the app and try again.</p></body></html>');
  } catch (err) {
    next(err);
  }
};

// @desc    Khalti return landing page
// @route   GET /api/payments/khalti/return
// @access  Public
const handleKhaltiReturn = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send('<html><body style="font-family:Arial;padding:20px;"><h2>Khalti redirect received</h2><p>Return to the app and tap verify payment.</p></body></html>');
};

module.exports = {
  getUserPayments,
  processAdvanceBookingPayment,
  initiateAdvanceBookingPayment,
  verifyEsewaPayment,
  verifyKhaltiPayment,
  renderEsewaCheckoutPage,
  handleEsewaSuccessRedirect,
  handleEsewaFailureRedirect,
  handleKhaltiReturn,
};
