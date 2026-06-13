import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, BUCKET_NAME } from '../config/s3.js';

// ---------------------------------------------------------------------------
// AWS S3 / MinIO Storage Configuration
// Instead of saving files to the hard drive, multerS3 intercepts the file 
// upload stream and pipes it directly into our S3 bucket. This means our 
// Express server's disk space will never fill up, no matter how many users we have!
// ---------------------------------------------------------------------------
const s3Storage = multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  // Attach some invisible metadata to the file in S3
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  // The "key" is the path and filename inside the S3 bucket. 
  key: function (req, file, cb) {
    // We prepend the current timestamp to avoid naming collisions if two users 
    // upload a resume named "resume.pdf" at the exact same time.
    // We also replace spaces with underscores for safer URL generation later.
    const uniqueFileName = `resumes/${Date.now()}-${file.originalname.replace(/\\s+/g, '_')}`;
    cb(null, uniqueFileName);
  }
});

// ---------------------------------------------------------------------------
// File Type Validation (Security)
// ---------------------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  // We only allow PDFs and Word Documents. 
  // This prevents malicious users from uploading .exe or .sh scripts to our bucket!
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/msword'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

// ---------------------------------------------------------------------------
// Export the configured Multer Middleware
// ---------------------------------------------------------------------------
export const upload = multer({
  storage: s3Storage, // Use our new S3 storage instead of disk!
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit to prevent huge files from eating our AWS bill
  },
  fileFilter,
});
