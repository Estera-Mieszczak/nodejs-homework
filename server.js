const path = require("path");
const express = require("express");
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
