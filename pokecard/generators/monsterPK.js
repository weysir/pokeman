const { Image, loadImage } = require('canvas');
const Jimp = require('jimp');
const imageUrlRegistry = require('../imageUrlRegistry');
const readAvatarImage = require('../utils/readAvatarImage');

const canvasWidth = 500;
const canvasHeight = 250;
const monsterWidth = 84;
const monsterHeight = 164;
const gravityFactor = 1.2;
const avatarSize = 25;

const calcCenterPoint = (a, b) => (a - b) / 2;
const calcStartXPerBlock = (index, length) => {
  const gapWidth = (canvasWidth - (monsterWidth * length)) / (length + 1);
  return (gapWidth * (index + 1)) + (monsterWidth * index);
};

const monsterOffsetY = calcCenterPoint(canvasHeight, monsterHeight) * gravityFactor;
const avatarOffsetY = monsterOffsetY + monsterHeight * .65;

const loadDecoratedImage = async (url, grayscaled) => {
  if (!grayscaled) {
    return await loadImage(url);
  }

  const imageOp = await Jimp.read(url);
  return new Promise(resolve => {
    imageOp.greyscale().getBuffer(Jimp.MIME_PNG, (err, buffer) => {
      const image = new Image();
      image.src = buffer;
      resolve(image);
    });
  });
};

// ctx: Context2D
//
// monsters: Array<Object<{
//   name: string,
//   blood: number,
//   exp: number,
//   type: MONSTER_PIKACHU | BEARY | DOGE,
// }>>
//
// players: Array<Object<{
//   name: string,
//   avatarUrl: string,
//   money: string,
//   gender: string,
// }>>
//
// pkResults: Array<boolean>
module.exports = async function generate(ctx, monsters, players, pkResults) {
  await Promise.all(monsters.map(async (monster, index) => {
    const player = players[index];
    const hasFailed = !pkResults[index];

    const monsterOffsetX = calcStartXPerBlock(index, monsters.length);
    const avatarOffsetX = (monsterOffsetX + monsterWidth) - (avatarSize / 2);

    const monsterImage = await loadDecoratedImage(imageUrlRegistry[monster.type], hasFailed);
    const avatarImage = await readAvatarImage(player.avatarUrl, avatarSize, { grayscale: hasFailed, rounded: true });

    ctx.drawImage(monsterImage, monsterOffsetX, monsterOffsetY, monsterWidth, monsterHeight);
    ctx.drawImage(avatarImage, avatarOffsetX, avatarOffsetY, avatarSize, avatarSize);
  }));
};

