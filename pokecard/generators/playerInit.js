const readAvatarImage = require('../utils/readAvatarImage');

const startY = 128;

const canvasWidth = 500;
const itemKeyOffsetX = 216;
const itemValueOffsetX = itemKeyOffsetX + 50;
const textLineGap = 18;

const avatarSize = 80;
const avatarStartX = canvasWidth - (avatarSize + 25);

const rowInfoItems = ['name', 'change', 'gender'];

const calcTextOffsetY = (baseHeight, index) => startY + baseHeight * index + textLineGap * index;

async function putPlayerInformationText(ctx, player) {
  const keyFontSize = 12;
  const valueFontSize = 22;
  const valueCenterDelta = (valueFontSize - keyFontSize) / 4;
  rowInfoItems.forEach((info, i) => {
    ctx.font = `${keyFontSize}px Helvetica`;
    ctx.fillText(info, itemKeyOffsetX, calcTextOffsetY(keyFontSize, i));
    ctx.font = `bold ${valueFontSize}px Helvetica`;
    ctx.fillText(player[info], itemValueOffsetX, calcTextOffsetY(keyFontSize, i) + valueCenterDelta);
  });
}

async function putPlayerAvatarImage(ctx, player) {
  const avatarImage = await readAvatarImage(player.avatarUrl, avatarSize);
  ctx.drawImage(avatarImage, avatarStartX, startY - 16, avatarSize, avatarSize);
}


// ctx: Context2D
//
// player: Object<{
//   name: string,
//   avatarUrl: string,
//   change: string,
//   gender: string,
// }>
module.exports = async function generate(ctx, player) {
  await putPlayerInformationText(ctx, player);
  await putPlayerAvatarImage(ctx, player);
};
