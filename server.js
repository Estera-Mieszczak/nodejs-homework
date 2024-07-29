const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const apiRouter = require("./routes/api/contacts");
// const { required } = require("joi");
const { setupFolder, isImageAndTransform } = require("./functions/functions");
const multer = require("multer");
const { v4: uuidV4 } = require("uuid");
const fs = require("fs").promises;

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.resolve(__dirname, "./public")));

require("dotenv").config();

const { DB_HOST: urlDb } = process.env;
const connection = mongoose.connect(urlDb);

const tempDir = path.join(process.cwd(), "temp");
const storageAvatarDir = path.join(process.cwd(), "public/avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidV4()}${file.originalname}`);
  },
});

const extensionWhiteList = [".jpg", ".jpeg", ".png", ".gif"];
const mimetypeWhiteList = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

const uploadMiddleware = multer({
  storage,
  fileFilter: async (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    if (
      !extensionWhiteList.includes(extension) ||
      !mimetypeWhiteList.includes(mimetype)
    ) {
      return cb(null, false);
    }
    return cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 5 },
});

app.post(
  "/upload",
  uploadMiddleware.single("avatar"),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "File is not a photo" });
    }

    const { path: temporaryPath } = req.file;
    const extension = path.extname(temporaryPath);
    const fileName = `${uuidV4()}${extension}`;
    const filePath = path.join(storageAvatarDir, fileName);

    try {
      await fs.rename(temporaryPath, filePath);
    } catch (e) {
      await fs.unlink(temporaryPath);
      return next(e);
    }

    const isValidAndTransform = await isImageAndTransform(filePath);
    if (!isValidAndTransform) {
      await fs.unlink(filePath);
      return res.status(400).json({ message: "Isnt a photo but pretending" });
    }
    res.redirect(`/avatars/${fileName}`);
  }
);

app.get("/avatars/:imgPath", (req, res) => {
  const { imgPath } = req.params;
  res.render("avatars", { imgPath });
});

app.use(express.json());
app.use(cors());

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Not found - ${req.path}` });
});

app.use((err, req, res, next) => {
  if (err.name === "Validation Error") {
    return res.status(400).json({
      message: err.message,
    });
  }
  res.status(500).json({ message: err.message || "Something went wrong" });
  console.log(err);
});

const startServer = async () => {
  try {
    await connection;
    console.log("Database connection successful");
    app.listen(3000, async () => {
      await setupFolder(tempDir);
      await setupFolder(storageAvatarDir);
      console.log("Server running. Use our API on port: 3000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
