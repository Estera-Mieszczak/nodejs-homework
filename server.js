const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const apiRouter = require("./routes/api/contacts");
const { setupFolder } = require("./functions/functions");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.resolve(__dirname, "./public")));

const tempDir = path.join(process.cwd(), "temp");
const storageAvatarDir = path.join(process.cwd(), "public/avatars");

require("dotenv").config();

const { DB_HOST: urlDb } = process.env;
const connection = mongoose.connect(urlDb);

// app.post(
//   "/upload",
//   uploadMiddleware.single("avatar"),
//   async (req, res, next) => {
//     if (!req.file) {
//       return res.status(400).json({ message: "File is not a photo" });
//     }

//     const { path: temporaryPath } = req.file;
//     const extension = path.extname(temporaryPath);
//     const fileName = `${uuidV4()}${extension}`;
//     const filePath = path.join(storageAvatarDir, fileName);

//     try {
//       await fs.rename(temporaryPath, filePath);
//     } catch (e) {
//       await fs.unlink(temporaryPath);
//       return next(e);
//     }

//     const isValidAndTransform = await isImageAndTransform(filePath);
//     if (!isValidAndTransform) {
//       await fs.unlink(filePath);
//       return res.status(400).json({ message: "Isnt a photo but pretending" });
//     }
//     res.redirect(`/avatars/${fileName}`);
//   }
// );

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
      console.log("Folder temp created");
      await setupFolder(storageAvatarDir);
      console.log("Folder avatars created");
      console.log("Server running. Use our API on port: 3000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
