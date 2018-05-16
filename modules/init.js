const rtm = require('bearychat')
  .rtm;
const player = require('./player');
const monster = require('./monster');
const error = require('./error');
const pokecard = require('../pokecard/generatorRegistry');
const pokecardConstants = require('../pokecard/constants');

const handler = async (ctx, args) => {
  if (args.length !== 0) {
    await error.invalidCommand(ctx);
    return;
  }

  const curUser = ctx.currentUser;

  let curPlayer = await player.repository.getByUid(ctx, curUser.id);

  if (!curPlayer) {
    const m = await monster.service.random(ctx);
    curPlayer = await player.repository.create(ctx, {
      name: curUser.name,
      user_id: curUser.id,
      team_id: curUser.team_id,
      gender: '未知',
      change: 100,
      monsters: [m],
    });
  }
  curPlayer.avatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/1200px-International_Pok%C3%A9mon_logo.svg.png';

  const card = await pokecard(pokecardConstants.COMMAND_PLAYER_INIT, [], [curPlayer], []);

  await ctx.sendCard(card);
};

module.exports = {
  handler
};
