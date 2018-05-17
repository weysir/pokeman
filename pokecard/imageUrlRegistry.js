const constants = require('./constants');
const path = require('path');

const mapToPaths = (dicts) => Object.keys(dicts).reduce((paths, key) => ({
  ...paths,
  [key]: path.resolve(__dirname, `./assets/${dicts[key]}`),
}), {});

module.exports = mapToPaths({
  [constants.COMMAND_MONSTER_LIST]: 'bg-list.jpeg',
  [constants.COMMAND_PLAYER_INIT]: 'bg-init.jpeg',
  [constants.COMMAND_MONSTER_CATCH_WATER]: 'bg-catch-water.jpeg',
  [constants.COMMAND_MONSTER_CATCH_GRASS]: 'bg-catch-grass.jpeg',
  [constants.COMMAND_MONSTER_CATCH_SAT]: 'bg-catch-sat.jpeg',
  [constants.COMMAND_MONSTER_PK_WIN]: 'bg-pkwin.jpeg',
  [constants.COMMAND_MONSTER_PK_FAIL]: 'bg-pkfail.jpeg',
  [constants.COMMAND_MONSTER_OPTIONS]: 'bg-catch-options.jpg',
  [constants.MONSTER_PIKACHU]: 'monster-pikachu.png',
  [constants.MONSTER_PSYDUCK]: 'monster-psyduck.png',
  [constants.MONSTER_DOGE]: 'monster-doge.png',
  [constants.SPECIAL_BEAR]: 'special-bear.png',
});
