const multer = require("multer");
const path = require("path");
const { v4: uuidV4 } = require("uuid");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "temp"));
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidV4()}${file.originalname}`);
  },
});

module.exports = { storage };
