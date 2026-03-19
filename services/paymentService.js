const Payment = require('../models/Payment');

const getUserPayments = async (userId) => {
    const payments = await Payment.find({ user_id: userId }).populate('booking_id');
    return payments;
};

module.exports = {
  getUserPayments,
};
