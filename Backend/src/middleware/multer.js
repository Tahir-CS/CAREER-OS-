import crypto from 'crypto';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, BUCKET_NAME } from '../config/s3.js';

const MIME_TO_EXTENSION = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const s3Storage = multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  metadata(req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key(req, file, cb) {
    const extension = MIME_TO_EXTENSION[file.mimetype];
    if (!extension) return cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));

    // Keep user-provided filenames out of object-storage keys. Resume names often contain PII.
    return cb(null, `resumes/${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (MIME_TO_EXTENSION[file.mimetype]) return cb(null, true);
  return cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
};

export const upload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter,
});
