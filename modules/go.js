const error = require('./error')
const player = require('./player');
const playState = require('./playState');
const monsterService = require('./monster')
  .service;

const charStartCode = 97;

const places = [
  {
    name: 'C 城草丛',
    desc: '可能会遇到皮卡丘',
  },
  {
    name: 'H 城水域',
    desc: '可能会遇到皮卡丘',
  },
  {
    name: 'J 城水域',
    desc: '可能会遇到皮卡丘',
  },
  {
    name: 'D 城草丛',
    desc: '可能会遇到皮卡丘',
  },
  {
    name: 'L 城空地',
    desc: '可能会遇到皮卡丘',
  },
];

const getPlaces = () => {
  return places;
};

const getPlaceByIdx = (idx) => {
  return places[idx];
};

const _outputPlace = (i, e) => {
  const c = String.fromCharCode(97 + i);
  return `${c}. ${e.name} (${e.desc})`;
};

const listPlaces = async (ctx, args) => {
  const text = getPlaces().map((e, i) => {
    return _outputPlace(i, e);
  }).join('\n');
  ctx.send(text);
};

const getMaybeRandomMonster = async (ctx, args) => {
  if (Math.floor(Math.random() * 100) % 2 === 0) {
    return null;
  }

  return await monsterService.random();
};

const goPlace = async (ctx, args) => {

  // At least one of monster is alive.
  const curPlayer = await player.service.getCurrentPlayer(ctx);
  const selectableMonsters = curPlayer.monsters.filter((m) => {
    return m.blood > 0;
  });

  if (selectableMonsters.length === 0) {
    return await ctx.send(`${curPlayer.name} 没有活跃的精灵`);
  }

  const c = args[0];
  const idx = c.charCodeAt(0) - charStartCode;
  const place = getPlaceByIdx(idx);
  if (!place) {
    return await error.placeItemNotFound(ctx);
  }

  const currentUser = ctx.currentUser;
  const monster = await getMaybeRandomMonster(ctx, args);

  if (!monster) {
    return ctx.send(`在 ${place.name} 中没遇到精灵`);
  } else {
    const state = await playState.service.getByUser(ctx, currentUser);
    await playState.service.enterBattble(ctx, state, { enemy: monster, curMonster: null });
    const monsterList = selectableMonsters.map((m, i) => {
      const x = String.fromCharCode(i + charStartCode);
      return `${x}. ${m.name} (血量 \`${m.blood}\`)`
    }).join('\n');

    return ctx.send(`遇到了 ${monster.name}!\n请选择出战的精灵: \n${monsterList}`);
  }
};

const handler = async (ctx, args) => {
  const subCommand = args[0];
  switch (subCommand) {
    case 'list':
      return await listPlaces(ctx, args);
    default:
      return await goPlace(ctx, args);
  }
};

module.exports = {
  handler,
};
