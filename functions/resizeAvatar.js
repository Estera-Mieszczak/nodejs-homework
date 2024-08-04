const Jimp = require("jimp");

const resizeAvatar = async (inputPath, outputPath) => {
  try {
    const image = await Jimp.read(inputPath);
    await image.resize(250, 250).writeAsync(outputPath);
  } catch (error) {
    console.log(error);
  }
};

module.exports = resizeAvatar;
