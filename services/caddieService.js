const Caddie = require('../models/Caddie');
const Booking = require('../models/Booking');

const normalizeCaddieData = (data = {}) => {
  const normalized = { ...data };

  if (normalized.image_url && !normalized.profile_img) {
    normalized.profile_img = normalized.image_url;
  }

  if (typeof normalized.experience === 'number' && typeof normalized.experience_years !== 'number') {
    normalized.experience_years = normalized.experience;
  }

  if (typeof normalized.experience_years === 'number' && typeof normalized.experience !== 'number') {
    normalized.experience = normalized.experience_years;
  }

  return normalized;
};

const getConfirmedCaddieBookingCount = async (caddieId) => {
  const confirmedCount = await Booking.countDocuments({
    booking_type: 'CADDIE',
    caddie_id: caddieId,
    status: 'CONFIRMED',
  });

  return confirmedCount;
};

const syncCaddieMatches = async (caddie) => {
  if (!caddie) {
    return null;
  }

  const confirmedCount = await getConfirmedCaddieBookingCount(caddie._id);
  if (caddie.matches_caddied !== confirmedCount) {
    caddie.matches_caddied = confirmedCount;
    await caddie.save();
  }

  return caddie;
};

const createCaddie = async (caddieData) => {
  const normalizedCaddieData = normalizeCaddieData(caddieData);
  const caddie = await Caddie.create(normalizedCaddieData);
  return caddie;
};

const getCaddies = async () => {
  return Caddie.find();
};

const getCaddieById = async (caddieId) => {
  const caddie = await Caddie.findById(caddieId);
  return caddie || null;
};

const updateCaddie = async (caddieId, caddieData) => {
  const normalizedCaddieData = normalizeCaddieData(caddieData);

  const caddie = await Caddie.findByIdAndUpdate(caddieId, normalizedCaddieData, {
    new: true,
    runValidators: true,
  });

  return caddie;
};

const deleteCaddie = async (caddieId) => {
  const caddie = await Caddie.findById(caddieId);
  if (caddie) {
    await caddie.remove();
  }
  return caddie;
};

const getCaddieAvailability = async (caddieId) => {
    const caddie = await Caddie.findById(caddieId);
    return caddie ? caddie.availability_slots : null;
};

const bookCaddie = async (userId, caddieId, slot) => {
    const caddie = await Caddie.findById(caddieId);
    if (!caddie) {
        throw new Error('Caddie not found');
    }

    const slotIndex = caddie.availability_slots.findIndex(s => new Date(s).toISOString() === new Date(slot).toISOString());
    if(slotIndex === -1) {
        throw new Error('Caddie not available for the selected slot');
    }
    
    // Remove the booked slot
    caddie.availability_slots.splice(slotIndex, 1);
    await caddie.save();
    
    const booking = new Booking({
        user_id: userId,
        booking_type: 'CADDIE',
        caddie_id: caddieId,
        status: 'CONFIRMED',
    });

    await booking.save();

    const updatedCaddie = await syncCaddieMatches(caddie);
    const bookingResponse = booking.toObject();
    bookingResponse.caddie = updatedCaddie;

    return bookingResponse;
};

const cancelCaddieBooking = async (bookingId, userId) => {
    const booking = await Booking.findOne({ _id: bookingId, user_id: userId });

    if (!booking) {
        throw new Error('Booking not found or user not authorized to cancel');
    }

    if(booking.booking_type !== 'CADDIE') {
        throw new Error('This booking is not for a caddie');
    }

    if (booking.status === 'CANCELLED') {
      const existingCaddie = await Caddie.findById(booking.caddie_id);
      const syncedExistingCaddie = existingCaddie ? await syncCaddieMatches(existingCaddie) : null;
      const existingBookingResponse = booking.toObject();
      existingBookingResponse.caddie = syncedExistingCaddie;
      return existingBookingResponse;
    }
    
    booking.status = 'CANCELLED';
    await booking.save();

    const caddie = await Caddie.findById(booking.caddie_id);
    const syncedCaddie = caddie ? await syncCaddieMatches(caddie) : null;

    // Make the caddie available again for the slot, if we stored the slot in the booking
    // For now, we are not re-adding the slot to the caddie's availability
    
    const bookingResponse = booking.toObject();
    bookingResponse.caddie = syncedCaddie;
    return bookingResponse;
};

module.exports = {
  createCaddie,
  getCaddies,
  getCaddieById,
  updateCaddie,
  deleteCaddie,
  getCaddieAvailability,
  bookCaddie,
  cancelCaddieBooking,
};
