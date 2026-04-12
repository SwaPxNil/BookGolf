const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const TeeTime = require('../models/TeeTime');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Coach = require('../models/Coach');
const Caddie = require('../models/Caddie');
const Course = require('../models/Course');
const teeTimeService = require('./teeTimeService');
const coachService = require('./coachService');
const caddieService = require('./caddieService');
const { sendBookingConfirmationEmail } = require('../utils/bookingEmail');

const PAYMENT_METHODS = ['ESEWA', 'KHALTI'];
const ESEWA_SIGNED_FIELDS = 'total_amount,transaction_uuid,product_code';

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

const getAdvanceAmount = (totalAmount) => roundMoney(Number(totalAmount || 0) / 3);

const createHttpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const toPositiveAmount = (value) => {
  const normalized = roundMoney(value);
  return normalized > 0 ? normalized : 0;
};

const toPaisa = (rupees) => Math.round(Number(rupees || 0) * 100);

const getCallbackBaseUrl = (options = {}) => {
  const fromOption = String(options.callbackBaseUrl || '').trim();
  if (fromOption) {
    return fromOption.replace(/\/$/, '');
  }

  const fromEnv = String(process.env.PAYMENT_CALLBACK_BASE_URL || '').trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

const getEsewaConfig = () => ({
  endpoint: process.env.ESEWA_SANDBOX_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
});

const getKhaltiConfig = () => ({
  initiateUrl: process.env.KHALTI_INITIATE_URL || 'https://a.khalti.com/api/v2/epayment/initiate/',
  lookupUrl: process.env.KHALTI_LOOKUP_URL || 'https://a.khalti.com/api/v2/epayment/lookup/',
  secretKey: process.env.KHALTI_SECRET_KEY,
});

const hmacBase64 = (message, secretKey) => {
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
};

const buildEsewaSignature = ({ totalAmount, transactionUuid, productCode, secretKey }) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return hmacBase64(message, secretKey);
};

const buildSignatureForSignedFields = (payload, signedFieldNames, secretKey) => {
  const fields = String(signedFieldNames || '')
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  const message = fields
    .map((field) => `${field}=${payload[field] ?? ''}`)
    .join(',');

  return hmacBase64(message, secretKey);
};

const safeBase64JsonDecode = (value) => {
  const decoded = Buffer.from(String(value || ''), 'base64').toString('utf8');
  return JSON.parse(decoded);
};

const httpJsonPost = async (url, body, headers = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let parsed;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = { raw };
  }

  if (!response.ok) {
    const err = new Error(parsed?.detail || parsed?.message || parsed?.error_key || 'Payment provider request failed');
    err.statusCode = 400;
    err.providerResponse = parsed;
    throw err;
  }

  return parsed;
};

const getPopulatedBooking = async (bookingId) => {
  if (!bookingId) {
    return null;
  }

  return Booking.findById(bookingId)
    .populate('course_id', 'name location')
    .populate('tee_time_id', 'slot_time price')
    .populate('coach_id', 'full_name')
    .populate('caddie_id', 'full_name');
};

const ensureOwnPayment = async (userId, paymentId) => {
  const payment = await Payment.findOne({ _id: paymentId, user_id: userId });
  if (!payment) {
    throw new Error('Payment not found');
  }
  return payment;
};

const finalizePaidPayment = async (payment, user, verificationInfo = {}) => {
  if (!payment) {
    throw new Error('Payment record not found');
  }

  if (payment.status === 'PAID') {
    const existingBooking = await getPopulatedBooking(payment.booking_id);
    return {
      booking: existingBooking,
      payment,
      totalAmount: roundMoney(payment.total_amount),
      advanceAmount: roundMoney(payment.amount),
    };
  }

  const bookingPayload = payment?.metadata?.bookingPayload;
  if (!bookingPayload || typeof bookingPayload !== 'object') {
    throw new Error('Booking payload is missing for this payment');
  }

  const details = await buildConfirmationDetails(bookingPayload);
  const booking = await createBookingForType(user._id, bookingPayload);
  const bookingId = booking?._id || booking?.id;

  if (!bookingId) {
    throw new Error('Booking could not be created after payment verification');
  }

  payment.status = 'PAID';
  payment.booking_id = bookingId;
  payment.verified_at = new Date();
  payment.provider_transaction_id = verificationInfo.providerTransactionId || payment.provider_transaction_id;
  payment.verification_reference = verificationInfo.verificationReference || payment.verification_reference;
  payment.metadata = {
    ...(payment.metadata || {}),
    verification: {
      ...(payment.metadata?.verification || {}),
      ...verificationInfo,
      verified_at: new Date().toISOString(),
    },
  };
  payment.markModified('metadata');
  await payment.save();

  const bookingType = String(payment.booking_type || '').toUpperCase();
  const totalAmount = roundMoney(payment.total_amount);
  const advanceAmount = roundMoney(payment.amount);

  try {
    await sendBookingConfirmationEmail({
      email: user.email,
      fullName: user.full_name,
      bookingType,
      serviceName: payment?.metadata?.serviceName || details?.serviceName || 'Booking service',
      slot: payment?.metadata?.slot || details?.slot,
      paymentMethod: payment.payment_method,
      totalAmount,
      advanceAmount,
    });
  } catch (emailError) {
    console.error('Booking confirmation email failed:', emailError.message);
  }

  const populatedBooking = await getPopulatedBooking(bookingId);
  return {
    booking: populatedBooking || booking,
    payment,
    totalAmount,
    advanceAmount,
  };
};

const buildEsewaCheckoutHtml = (formAction, fields = {}) => {
  const hiddenFields = Object.entries(fields)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value ?? '')}" />`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirecting to eSewa</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f6f3; color: #223028; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
    .card { background:#fff; border:1px solid #d8dece; border-radius:12px; padding:24px; max-width:420px; text-align:center; }
    .small { color:#5a6a5b; font-size:14px; margin-top:8px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Redirecting to eSewa Sandbox</h2>
    <p>Please wait while we securely transfer your payment request.</p>
    <p class="small">If you are not redirected, click continue.</p>
    <form id="esewa-form" action="${formAction}" method="POST">
      ${hiddenFields}
      <button type="submit">Continue</button>
    </form>
  </div>
  <script>
    document.getElementById('esewa-form').submit();
  </script>
</body>
</html>`;
};

const findTeeTimeByIdFlexible = async (id) => {
  const normalizedId = String(id || '').trim();

  if (!normalizedId) {
    return null;
  }

  const byModelId = await TeeTime.findById(normalizedId);
  if (byModelId) {
    return byModelId;
  }

  if (mongoose.Types.ObjectId.isValid(normalizedId)) {
    const byObjectId = await TeeTime.collection.findOne({
      _id: new mongoose.Types.ObjectId(normalizedId),
    });

    if (byObjectId) {
      return byObjectId;
    }
  }

  return null;
};

const resolveTeeTimeDetails = async (teeTimeId) => {
  const normalizedId = String(teeTimeId || '').trim();
  const separatorIndex = normalizedId.indexOf('__');
  const templateId = separatorIndex === -1 ? normalizedId : normalizedId.slice(0, separatorIndex);
  const slotValue = separatorIndex === -1 ? null : decodeURIComponent(normalizedId.slice(separatorIndex + 2));

  const teeTime = await findTeeTimeByIdFlexible(templateId);
  if (!teeTime) {
    throw new Error('Tee time not found');
  }

  const course = await Course.findById(teeTime.course_id);
  const slot = slotValue || teeTime.slot_time;

  return {
    totalAmount: roundMoney(teeTime.price),
    slot,
    serviceName: course?.name || 'Tee time',
  };
};

const resolveCoachBookingDetails = async (coachId, lessonId, slot) => {
  const coach = await Coach.findById(coachId);
  if (!coach) {
    throw new Error('Coach not found');
  }

  const lesson = coach.lessons.id(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  return {
    totalAmount: roundMoney(lesson.price),
    slot,
    serviceName: `${coach.full_name} - ${lesson.title}`,
  };
};

const resolveCaddieBookingDetails = async (caddieId, slot, totalAmount) => {
  const caddie = await Caddie.findById(caddieId);
  if (!caddie) {
    throw new Error('Caddie not found');
  }

  const resolvedAmount = roundMoney(totalAmount);
  if (!resolvedAmount) {
    throw new Error('Caddie price is required');
  }

  return {
    totalAmount: resolvedAmount,
    slot,
    serviceName: caddie.full_name || 'Caddie service',
  };
};

const buildConfirmationDetails = async (payload) => {
  switch (payload.bookingType) {
    case 'TEE_TIME':
      return resolveTeeTimeDetails(payload.teeTimeId);
    case 'COACH':
      return resolveCoachBookingDetails(payload.coachId, payload.lessonId, payload.slot);
    case 'CADDIE':
      return resolveCaddieBookingDetails(payload.caddieId, payload.slot, payload.totalAmount);
    default:
      throw new Error('Unsupported booking type');
  }
};

const createBookingForType = async (userId, payload) => {
  switch (payload.bookingType) {
    case 'TEE_TIME':
      return teeTimeService.bookTeeTime(userId, payload.teeTimeId);
    case 'COACH':
      return coachService.bookCoachLesson(userId, payload.coachId, payload.lessonId, payload.slot);
    case 'CADDIE':
      return caddieService.bookCaddie(userId, payload.caddieId, payload.slot);
    default:
      throw new Error('Unsupported booking type');
  }
};

const processAdvanceBookingPayment = async (user, payload) => {
  const paymentMethod = String(payload?.paymentMethod || '').trim().toUpperCase();
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw createHttpError('Invalid payment method', 400);
  }

  const bookingType = String(payload?.bookingType || '').trim().toUpperCase();
  const bookingInput = { ...payload, bookingType };
  const details = await buildConfirmationDetails(bookingInput);
  const booking = await createBookingForType(user._id, bookingInput);
  const bookingId = booking?._id || booking?.id;

  if (!bookingId) {
    throw new Error('Booking could not be created');
  }

  const totalAmount = roundMoney(details.totalAmount);
  const advanceAmount = getAdvanceAmount(totalAmount);

  const payment = await Payment.create({
    user_id: user._id,
    booking_id: bookingId,
    booking_type: bookingType,
    payment_method: paymentMethod,
    amount: advanceAmount,
    total_amount: totalAmount,
    status: 'PAID',
  });

  try {
    await sendBookingConfirmationEmail({
      email: user.email,
      fullName: user.full_name,
      bookingType,
      serviceName: details.serviceName,
      slot: details.slot,
      paymentMethod,
      totalAmount,
      advanceAmount,
    });
  } catch (emailError) {
    console.error('Booking confirmation email failed:', emailError.message);
  }

  const populatedBooking = await Booking.findById(bookingId)
    .populate('course_id', 'name location')
    .populate('tee_time_id', 'slot_time price')
    .populate('coach_id', 'full_name')
    .populate('caddie_id', 'full_name');

  return {
    booking: populatedBooking || booking,
    payment,
    totalAmount,
    advanceAmount,
  };
};

const initiateAdvanceBookingPayment = async (user, payload, options = {}) => {
  const paymentMethod = String(payload?.paymentMethod || '').trim().toUpperCase();
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  const bookingType = String(payload?.bookingType || '').trim().toUpperCase();
  const bookingPayload = { ...payload, bookingType, paymentMethod };
  const details = await buildConfirmationDetails(bookingPayload);

  const totalAmount = toPositiveAmount(details.totalAmount);
  const advanceAmount = getAdvanceAmount(totalAmount);
  if (!advanceAmount) {
    throw createHttpError('Payment amount must be greater than zero', 400);
  }

  const payment = await Payment.create({
    user_id: user._id,
    booking_type: bookingType,
    payment_method: paymentMethod,
    amount: advanceAmount,
    total_amount: totalAmount,
    status: 'PENDING',
    metadata: {
      bookingPayload,
      serviceName: details.serviceName,
      slot: details.slot,
      platform: 'SANDBOX',
    },
  });

  if (paymentMethod === 'ESEWA') {
    const esewa = getEsewaConfig();
    const callbackBaseUrl = getCallbackBaseUrl(options);
    const transactionUuid = `${payment._id}-${Date.now()}`;
    const totalAmountText = advanceAmount.toFixed(2);

    const successUrl = `${callbackBaseUrl}/api/payments/esewa/success/${payment._id}`;
    const failureUrl = `${callbackBaseUrl}/api/payments/esewa/failure/${payment._id}`;
    const signature = buildEsewaSignature({
      totalAmount: totalAmountText,
      transactionUuid,
      productCode: esewa.productCode,
      secretKey: esewa.secretKey,
    });

    const formFields = {
      amount: totalAmountText,
      tax_amount: '0',
      total_amount: totalAmountText,
      transaction_uuid: transactionUuid,
      product_code: esewa.productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: ESEWA_SIGNED_FIELDS,
      signature,
    };

    payment.provider_transaction_id = transactionUuid;
    payment.metadata = {
      ...(payment.metadata || {}),
      esewa: {
        endpoint: esewa.endpoint,
        formFields,
      },
    };
    payment.markModified('metadata');
    await payment.save();

    return {
      payment,
      paymentId: payment._id,
      paymentMethod,
      totalAmount,
      advanceAmount,
      checkout: {
        provider: 'ESEWA',
        mode: 'FORM',
        actionUrl: esewa.endpoint,
        checkoutUrl: `${callbackBaseUrl}/api/payments/esewa/checkout/${payment._id}`,
        fields: formFields,
      },
    };
  }

  const khalti = getKhaltiConfig();
  if (!khalti.secretKey) {
    throw createHttpError('Khalti secret key is missing. Set KHALTI_SECRET_KEY in backend environment.', 500);
  }

  const callbackBaseUrl = getCallbackBaseUrl(options);
  const purchaseOrderId = `BOOK-${payment._id}`;
  const amountPaisa = toPaisa(advanceAmount);

  const returnUrl = `${callbackBaseUrl}/api/payments/khalti/return?paymentId=${payment._id}`;
  const websiteUrl = callbackBaseUrl;

  const khaltiResponse = await httpJsonPost(
    khalti.initiateUrl,
    {
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: amountPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: details.serviceName || `${bookingType} booking advance`,
      customer_info: {
        name: user.full_name || 'Sandbox User',
        email: user.email || 'sandbox@example.com',
        phone: user.phone_number || '9800000001',
      },
    },
    {
      Authorization: `Key ${khalti.secretKey}`,
    }
  );

  const pidx = khaltiResponse?.pidx;
  if (!pidx) {
    throw createHttpError('Khalti initiate did not return pidx', 400);
  }

  payment.provider_transaction_id = pidx;
  payment.metadata = {
    ...(payment.metadata || {}),
    khalti: {
      pidx,
      payment_url: khaltiResponse?.payment_url,
      expires_at: khaltiResponse?.expires_at,
      expires_in: khaltiResponse?.expires_in,
      return_url: returnUrl,
    },
  };
  payment.markModified('metadata');
  await payment.save();

  return {
    payment,
    paymentId: payment._id,
    paymentMethod,
    totalAmount,
    advanceAmount,
    checkout: {
      provider: 'KHALTI',
      mode: 'REDIRECT',
      paymentUrl: khaltiResponse?.payment_url,
      pidx,
      returnUrl,
      raw: khaltiResponse,
    },
  };
};

const captureEsewaRedirectData = async ({ paymentId, data, status = 'SUCCESS' }) => {
  let resolvedPaymentId = paymentId;

  if (!resolvedPaymentId && data) {
    try {
      const decodedPayload = safeBase64JsonDecode(data);
      const transactionUuid = String(decodedPayload?.transaction_uuid || '').trim();
      if (transactionUuid) {
        const paymentByTxn = await Payment.findOne({ provider_transaction_id: transactionUuid });
        resolvedPaymentId = paymentByTxn?._id;
      }
    } catch (error) {
      // Ignore decode failures here; verify endpoint will enforce payload validity.
    }
  }

  const payment = resolvedPaymentId ? await Payment.findById(resolvedPaymentId) : null;
  if (!payment) {
    return null;
  }

  payment.metadata = {
    ...(payment.metadata || {}),
    esewa: {
      ...(payment.metadata?.esewa || {}),
      redirect_data: data || null,
      redirect_status: status,
      redirected_at: new Date().toISOString(),
    },
  };
  payment.markModified('metadata');
  await payment.save();
  return payment;
};

const getEsewaCheckoutPage = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  const esewaEndpoint = payment?.metadata?.esewa?.endpoint;
  const formFields = payment?.metadata?.esewa?.formFields;

  if (!esewaEndpoint || !formFields) {
    throw new Error('eSewa checkout payload not found');
  }

  return buildEsewaCheckoutHtml(esewaEndpoint, formFields);
};

const verifyEsewaAdvancePayment = async (user, payload = {}) => {
  const payment = await ensureOwnPayment(user._id, payload.paymentId);
  if (String(payment.payment_method || '').toUpperCase() !== 'ESEWA') {
    throw createHttpError('Payment method mismatch for eSewa verification', 400);
  }

  if (payment.status === 'PAID') {
    return finalizePaidPayment(payment, user, {
      provider: 'ESEWA',
      alreadyVerified: true,
    });
  }

  const encodedData = payload.data || payment?.metadata?.esewa?.redirect_data;
  if (!encodedData) {
    throw createHttpError('eSewa redirect data is missing. Complete payment on eSewa and try verify again.', 409);
  }

  const decodedPayload = safeBase64JsonDecode(encodedData);
  const signedFieldNames = decodedPayload?.signed_field_names || ESEWA_SIGNED_FIELDS;
  const receivedSignature = decodedPayload?.signature;

  if (!receivedSignature) {
    throw createHttpError('Invalid eSewa response: signature not found', 400);
  }

  const esewa = getEsewaConfig();
  const expectedSignature = buildSignatureForSignedFields(decodedPayload, signedFieldNames, esewa.secretKey);
  if (expectedSignature !== receivedSignature) {
    throw createHttpError('eSewa verification failed: signature mismatch', 400);
  }

  const responseTransactionUuid = String(decodedPayload?.transaction_uuid || '');
  if (!responseTransactionUuid || responseTransactionUuid !== String(payment.provider_transaction_id || '')) {
    throw createHttpError('eSewa verification failed: transaction UUID mismatch', 400);
  }

  const productCode = String(decodedPayload?.product_code || '');
  if (productCode !== esewa.productCode) {
    throw createHttpError('eSewa verification failed: product code mismatch', 400);
  }

  const responseAmount = roundMoney(decodedPayload?.total_amount || decodedPayload?.amount || 0);
  if (Math.abs(responseAmount - roundMoney(payment.amount)) > 0.01) {
    throw createHttpError('eSewa verification failed: amount mismatch', 400);
  }

  const transactionCode = String(decodedPayload?.transaction_code || '');
  return finalizePaidPayment(payment, user, {
    provider: 'ESEWA',
    providerTransactionId: responseTransactionUuid,
    verificationReference: transactionCode || responseTransactionUuid,
    decodedPayload,
  });
};

const verifyKhaltiAdvancePayment = async (user, payload = {}) => {
  const payment = await ensureOwnPayment(user._id, payload.paymentId);
  if (String(payment.payment_method || '').toUpperCase() !== 'KHALTI') {
    throw createHttpError('Payment method mismatch for Khalti verification', 400);
  }

  if (payment.status === 'PAID') {
    return finalizePaidPayment(payment, user, {
      provider: 'KHALTI',
      alreadyVerified: true,
    });
  }

  const pidx = payload.pidx || payment.provider_transaction_id || payment?.metadata?.khalti?.pidx;
  if (!pidx) {
    throw createHttpError('Khalti pidx is missing for verification', 400);
  }

  const khalti = getKhaltiConfig();
  if (!khalti.secretKey) {
    throw createHttpError('Khalti secret key is missing. Set KHALTI_SECRET_KEY in backend environment.', 500);
  }

  const lookupResponse = await httpJsonPost(
    khalti.lookupUrl,
    { pidx },
    {
      Authorization: `Key ${khalti.secretKey}`,
    }
  );

  const status = String(lookupResponse?.status || '').toUpperCase();
  if (status !== 'COMPLETED') {
    throw createHttpError(`Khalti payment status is ${lookupResponse?.status || 'unknown'}. Payment not completed yet.`, 409);
  }

  const paidPaisa = Number(lookupResponse?.total_amount ?? lookupResponse?.amount ?? 0);
  const expectedPaisa = toPaisa(payment.amount);
  if (paidPaisa !== expectedPaisa) {
    throw createHttpError('Khalti verification failed: amount mismatch', 400);
  }

  return finalizePaidPayment(payment, user, {
    provider: 'KHALTI',
    providerTransactionId: pidx,
    verificationReference: lookupResponse?.transaction_id || pidx,
    lookupPayload: lookupResponse,
  });
};

module.exports = {
  getAdvanceAmount,
  processAdvanceBookingPayment,
  initiateAdvanceBookingPayment,
  verifyEsewaAdvancePayment,
  verifyKhaltiAdvancePayment,
  getEsewaCheckoutPage,
  captureEsewaRedirectData,
};
