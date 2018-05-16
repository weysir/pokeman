const {
  createCanvas,
  loadImage
} = require('canvas');
const constants = require('./constants');
const imageUrlRegistry = require('./imageUrlRegistry');
const generateMonsterListImage = require('./generators/monsterList');
const generatePlayerInitializationImage = require('./generators/playerInit');
const generateMonsterCatchImage = require('./generators/monsterCatch');
const generateMonsterPKImage = require('./generators/monsterPK');

async function putBackgroundImage(ctx, bgUrl) {
  const image = await loadImage(bgUrl);
  ctx.drawImage(image, 0, 0, 500, 250);
  return ctx;
}

// command: COMMAND_MONSTER_LIST | COMMAND_PLAYER_INIT | COMMAND_MONSTER_CATCH_WATER | COMMAND_MONSTER_PK_WIN | COMMAND_MONSTER_PK_FAIL
//
// monsters: Array<Object<{
//   name: string,
//   blood: number,
//   exp: number,
//   type: MONSTER_PIKACHU | MONSTER_BULBASAUR | MONSTER_PSYDUCK | MONSTER_DOGE | SPECIAL_BEAR,
// }>>
//
// players: Array<Object<{
//   name: string,
//   avatar_url: string,
//   money: string,
//   gender: string,
// }>>
//
// pkResults: Array<boolean>
module.exports = async function generate(command, monsters = [], players = [],
  pkResults = []) {
  const canvas = createCanvas(500, 250);
  const ctx = canvas.getContext('2d');
  await putBackgroundImage(ctx, imageUrlRegistry[command]);

  switch (command) {
    case constants.COMMAND_PLAYER_INIT:
      await generatePlayerInitializationImage(ctx, players[0]);
      break;
    case constants.COMMAND_MONSTER_LIST:
      await generateMonsterListImage(ctx, monsters, players[0]);
      break;
    case constants.COMMAND_MONSTER_CATCH_WATER:
    case constants.COMMAND_MONSTER_CATCH_GRASS:
    case constants.COMMAND_MONSTER_CATCH_SAT:
      await generateMonsterCatchImage(ctx, monsters[0]);
      break;
    case constants.COMMAND_MONSTER_PK_WIN:
    case constants.COMMAND_MONSTER_PK_FAIL:
      await generateMonsterPKImage(ctx, monsters, players, pkResults);
      break;
    default:
  }

  return {
    getBase64: () => new Promise(resolve => canvas.toDataURL('image/jpeg', {
      progressive: true,
      quality: 50,
      bufsize: 4096 * 2
    }, (_, base64) => resolve(base64))),
    getStream: () => canvas.jpegStream()
  };
};
