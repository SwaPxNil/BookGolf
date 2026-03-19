const cloudinary = require('./config/cloudinary');

const ensureCloudinaryConfig = () => {
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    const err = new Error(`Cloudinary is not configured. Missing: ${missingVars.join(', ')}`);
    err.statusCode = 500;
    throw err;
  }
};

const uploadImageBuffer = async (file, folder = 'general') => {
  if (!file || !file.buffer) {
    return null;
  }

  ensureCloudinaryConfig();

  const base64 = file.buffer.toString('base64');
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `fypbackend/${folder}`,
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
};

module.exports = {
  uploadImageBuffer,
};
