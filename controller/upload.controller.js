const multer = require('multer');
const multerS3 = require('multer-s3');
const wasabi = require('../utils/wasabi');

// Optional: File type filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: wasabi,
    bucket: process.env.WASABI_BUCKET_NAME,
    acl: 'public-read',
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter, // Add file filter here
});

const singleUpload = upload.single('image');

exports.uploadImage = (req, res) => {
  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error', details: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }

    if (!req.file || !req.file.location) {
      return res.status(400).json({ error: 'No file uploaded or URL not available' });
    }

    return res.status(200).json({
      message: 'Image uploaded successfully!',
      imageUrl: req.file.location,
    });
  });
};
