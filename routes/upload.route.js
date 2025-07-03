const express = require('express');
const { upload } = require('../middleware/multer.middleware.js');
const { uploadFileToWasabi, deleteFromWasabi } = require('../utils/wasabi.js');

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const result = await uploadFileToWasabi({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: result.fileUrl,
      wasabiKey: result.wasabiKey,
    });
  } catch (error) {
    console.error('Wasabi upload error:', error);
    res.status(500).json({ message: 'Upload error', error: error.message });
  }
});

router.delete('/:wasabiKey', async (req, res) => {
  try {
    await deleteFromWasabi(req.params.wasabiKey);
    res.status(200).json({ message: 'Deleted from Wasabi' });
  } catch (error) {
    console.error('Wasabi delete error:', error);
    res.status(500).json({ message: 'Delete error', error: error.message });
  }
});

module.exports = router;
