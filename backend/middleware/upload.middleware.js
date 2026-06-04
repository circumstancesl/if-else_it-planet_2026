const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function createUpload(folderName) {
  const uploadDir = path.join(__dirname, `../uploads/${folderName}`);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${folderName.slice(0, -1)}-${crypto.randomUUID()}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы изображений (JPEG, PNG, WebP)'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 МБ
  });
}

module.exports = {
  uploadCompany: createUpload('companies'),
  uploadCandidate: createUpload('candidates'),
};