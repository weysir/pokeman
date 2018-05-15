const { loadImage } = require('canvas');
const imageUrlRegistry = require('../imageUrlRegistry');

const canvasWidth = 500;
const canvasHeight = 250;
const monsterWidth = 84;
const monsterHeight = 164;
const gravityFactor = 1.2;

const calcCenterPoint = (a, b) => (a - b) / 2;

const centerX = calcCenterPoint(canvasWidth, monsterWidth);
const centerY = calcCenterPoint(canvasHeight, monsterHeight) * gravityFactor;

async function putMonsterImage(ctx, monsterUrl) {
  const image = await loadImage(monsterUrl);
  ctx.drawImage(image, centerX, centerY, monsterWidth, monsterHeight);
}


// ctx: Context2D
//
// monster: Object<{
//   name: string,
//   blood: number,
//   exp: number,
//   type: MONSTER_PIKACHU | BEARY | DOGE,
// }>
module.exports = async function generate(ctx, { type }) {
  await putMonsterImage(ctx, imageUrlRegistry[type]);
};
