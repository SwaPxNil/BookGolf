const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadSingleImage = (fieldName = 'image') => upload.single(fieldName);

const parseJsonFields = (fields = []) => (req, res, next) => {
  try {
    fields.forEach((field) => {
      const value = req.body[field];
      if (typeof value === 'string') {
        req.body[field] = JSON.parse(value);
      }
    });
    next();
  } catch (err) {
    next(new Error('Invalid JSON in multipart form-data fields'));
  }
};

module.exports = {
  uploadSingleImage,
  parseJsonFields,
};
