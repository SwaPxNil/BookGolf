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

const looksLikeJson = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return (
    trimmed.startsWith('{')
    || trimmed.startsWith('[')
    || trimmed === 'null'
    || trimmed === 'true'
    || trimmed === 'false'
    || /^-?\d+(\.\d+)?$/.test(trimmed)
  );
};

const safeParseJson = (value) => {
  if (!looksLikeJson(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};

const setNestedArrayValue = (target, index, prop, value) => {
  if (!target[index]) {
    target[index] = {};
  }
  target[index][prop] = value;
};

const parseBracketOrDotNotationField = (body, field) => {
  const keys = Object.keys(body || {});
  const collected = [];
  const consumedKeys = [];

  // Supports lessons[0][title]
  const bracketPattern = new RegExp(`^${field}\\[(\\d+)\\]\\[([^\\]]+)\\]$`);
  // Supports lessons.0.title
  const dotPattern = new RegExp(`^${field}\\.(\\d+)\\.([^\\.]+)$`);

  keys.forEach((key) => {
    const bracketMatch = key.match(bracketPattern);
    if (bracketMatch) {
      const index = Number(bracketMatch[1]);
      const prop = bracketMatch[2];
      setNestedArrayValue(collected, index, prop, body[key]);
      consumedKeys.push(key);
      return;
    }

    const dotMatch = key.match(dotPattern);
    if (dotMatch) {
      const index = Number(dotMatch[1]);
      const prop = dotMatch[2];
      setNestedArrayValue(collected, index, prop, body[key]);
      consumedKeys.push(key);
    }
  });

  if (!collected.length) {
    return null;
  }

  consumedKeys.forEach((key) => delete body[key]);

  return collected.filter(Boolean);
};

const parseJsonFields = (fields = []) => (req, res, next) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  req.body = body;

  fields.forEach((field) => {
    let value = body[field];

    if (typeof value === 'string') {
      body[field] = safeParseJson(value);
      value = body[field];
    }

    if (Array.isArray(value) && value.every((entry) => typeof entry === 'string')) {
      body[field] = value.map((entry) => safeParseJson(entry));
      value = body[field];
    }

    // Handle multipart form-data keys like lessons[0][title] or lessons.0.title
    if (typeof value === 'undefined') {
      const parsedFromNotation = parseBracketOrDotNotationField(body, field);
      if (parsedFromNotation) {
        body[field] = parsedFromNotation;
      }
    }
  });

  next();
};

module.exports = {
  uploadSingleImage,
  parseJsonFields,
};
