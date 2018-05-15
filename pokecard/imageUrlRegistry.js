const constants = require('./constants');
const path = require('path');

const mapToPaths = (dicts) => Object.keys(dicts).reduce((paths, key) => ({
  ...paths,
  [key]: path.resolve(__dirname, `./assets/${dicts[key]}`),
}), {});

module.exports = mapToPaths({
  [constants.COMMAND_MONSTER_LIST]: 'bg-list.jpeg',
  [constants.COMMAND_PLAYER_INIT]: 'bg-init.jpeg',
  [constants.COMMAND_MONSTER_CATCH]: 'bg-catch.jpeg',
  [constants.COMMAND_MONSTER_PK_WIN]: 'bg-pkwin.jpeg',
  [constants.COMMAND_MONSTER_PK_FAIL]: 'bg-pkfail.jpeg',
  [constants.MONSTER_PIKACHU]: 'monster-pikachu.png',
});
