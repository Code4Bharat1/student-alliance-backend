const multer = require('multer');

const storage = multer.memoryStorage(); // Uploads file to memory buffer
const upload = multer({ storage });
module.exports = { upload };
