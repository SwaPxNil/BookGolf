const caddieService = require('../services/caddieService');
const { uploadImageBuffer } = require('../utils/cloudinaryUpload');

// @desc    Create a caddie
// @route   POST /api/caddies
// @access  Private (COURSE_ADMIN)
const createCaddie = async (req, res, next) => {
  try {
    const caddieData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, 'caddies');
      caddieData.profile_img = uploadResult.url;
    }

    const caddie = await caddieService.createCaddie(caddieData);
    res.status(201).json({
      success: true,
      data: caddie,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all caddies
// @route   GET /api/caddies
// @access  Public
const getCaddies = async (req, res, next) => {
  try {
    const caddies = await caddieService.getCaddies();
    res.status(200).json({
      success: true,
      count: caddies.length,
      data: caddies,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single caddie
// @route   GET /api/caddies/:id
// @access  Public
const getCaddie = async (req, res, next) => {
  try {
    const caddie = await caddieService.getCaddieById(req.params.id);
    if (!caddie) {
      return res.status(404).json({ success: false, msg: 'Caddie not found' });
    }
    res.status(200).json({
      success: true,
      data: caddie,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a caddie
// @route   PUT /api/caddies/:id
// @access  Private (COURSE_ADMIN)
const updateCaddie = async (req, res, next) => {
  try {
    const caddieData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, 'caddies');
      caddieData.profile_img = uploadResult.url;
    }

    const caddie = await caddieService.updateCaddie(req.params.id, caddieData);
    if (!caddie) {
      return res.status(404).json({ success: false, msg: 'Caddie not found' });
    }
    res.status(200).json({
      success: true,
      data: caddie,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a caddie
// @route   DELETE /api/caddies/:id
// @access  Private (COURSE_ADMIN)
const deleteCaddie = async (req, res, next) => {
  try {
    const caddie = await caddieService.deleteCaddie(req.params.id);
    if (!caddie) {
      return res.status(404).json({ success: false, msg: 'Caddie not found' });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get availability for a caddie
// @route   GET /api/caddies/:id/availability
// @access  Public
const getCaddieAvailability = async (req, res, next) => {
  try {
    const availability = await caddieService.getCaddieAvailability(req.params.id);
    if (!availability) {
      return res.status(404).json({ success: false, msg: 'Caddie not found' });
    }
    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Book a caddie
// @route   POST /api/caddies/book
// @access  Private (USER)
const bookCaddie = async (req, res, next) => {
    try {
        const { caddieId, slot } = req.body;
        const userId = req.user.id;
        
        const booking = await caddieService.bookCaddie(userId, caddieId, slot);

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel a caddie booking
// @route   DELETE /api/caddies/book/:bookingId
// @access  Private (USER)
const cancelCaddieBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        
        const booking = await caddieService.cancelCaddieBooking(bookingId, userId);

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
  createCaddie,
  getCaddies,
  getCaddie,
  updateCaddie,
  deleteCaddie,
  getCaddieAvailability,
  bookCaddie,
  cancelCaddieBooking,
};
