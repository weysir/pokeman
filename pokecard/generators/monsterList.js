const { loadImage } = require('canvas');
const imageUrlRegistry = require('../imageUrlRegistry');

const startX = 73;
const gapWidth = 52;
const monsterWidth = 84;

const calcImageOffsetX = (index) => startX + (monsterWidth * index) + (gapWidth * index);

async function putMonsterImage(ctx, index, monsterUrl) {
  const offsetTop = 23;
  const imageX = calcImageOffsetX(index);

  console.log(monsterUrl);
  const image = await loadImage(monsterUrl);
  ctx.drawImage(image, imageX, offsetTop, 84, 164);
}

async function putMonsterMetaText(ctx, index, { name, exp = 100, blood = 100 }) {
  const offsetTop = 205;
  const lineGap = 15;
  const textX = calcImageOffsetX(index);

  ctx.font = 'bold 16px Helvetica';
  ctx.fillText(name, textX, offsetTop);
  ctx.font = '10px Helvetica';
  ctx.fillText(`exp ${exp} / blood ${blood}`, textX, offsetTop + lineGap);
}

// monsters: Array<Object<{
//   name: string,
//   blood: number,
//   exp: number,
//   type: PICAQIU | BEARY | DOGE
// }>>
module.exports = async function generate(ctx, monsters, player) {
  await Promise.all(monsters.map((m, i) => putMonsterImage(ctx, i, imageUrlRegistry[m.type])));
  await Promise.all(monsters.map((m, i) => putMonsterMetaText(ctx, i, m)));
};
