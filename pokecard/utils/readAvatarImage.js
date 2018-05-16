const Jimp = require('jimp');
const { Image } = require('canvas');

module.exports = async function readAvatarImage(avatarUrl, size, { grayscale, rounded } = {}) {
  return new Promise(resolve => {
    imageOp.resize(size, size);
    grayscale && imageOp.grayscale();
    imageOp.getBuffer(Jimp.MIME_PNG, (_, buffer) => {
      const image = new Image();
      image.src = buffer;
      resolve(image);
    });
  });
};
