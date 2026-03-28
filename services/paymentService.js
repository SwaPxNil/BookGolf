const Payment = require('../models/Payment');

const getUserPayments = async (userId) => {
    const payments = await Payment.find({ user_id: userId })
      .sort({ created_at: -1 })
      .populate('booking_id');
    return payments;
};

module.exports = {
  getUserPayments,
};
