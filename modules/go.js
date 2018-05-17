const error = require('./error');
const player = require('./player');
const playState = require('./playState');
const monsterService = require('./monster')
  .service;
const pokecard = require('../pokecard/generatorRegistry');
const pokecardConstants = require('../pokecard/constants');

const charStartCode = 97;

const places = [{
    name: '霹雳草丛',
    desc: '大概率遇到皮卡丘',
  },
  {
    name: '有很多小龙虾的水域',
    desc: '可能会遇到。。。你猜啊',
  },
  {
    name: '卫星大厦 802',
    desc: '可能会遇到`超级无敌厉害`的`一熊宝宝`',
  },
  {
    name: '什么都没有的空地',
    desc: '可能什么都不会遇到，看心情吧',
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
  const card = await pokecard(pokecardConstants.COMMAND_MONSTER_OPTIONS, [], [], []);

  await ctx.sendCard(card, getPlaces()
    .map((e, i) => {
      return _outputPlace(i, e);
    })
    .join('\n'));
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
  const selectableMonsters = curPlayer.monsters.filter((m) => m.blood > 0);

  if (selectableMonsters.length === 0) {
    await ctx.send(`${curPlayer.name} 没有活跃的精灵`);
    return;
  }

  const c = args[0];
  const idx = c.charCodeAt(0) - charStartCode;
  const place = getPlaceByIdx(idx);
  if (!place) {
    await error.placeItemNotFound(ctx);
    return;
  }

  const currentUser = ctx.currentUser;
  const monster = await getMaybeRandomMonster(ctx, args);

  if (!monster) {
    await ctx.send(`在 ${place.name} 中没遇到精灵`);
    return;
  } else {
    const state = await playState.service.getByUser(ctx, currentUser);
    await playState.service.enterBattble(ctx, state, {
      enemy: monster,
      curMonster: null
    });
    const monsterList = selectableMonsters.map((m, i) => {
        const x = String.fromCharCode(i + charStartCode);
        return `${x}. ${m.name} (血量 \`${m.blood}\`)`;
      })
      .join('\n');

    const card = await pokecard(pokecardConstants.COMMAND_MONSTER_LIST,
      selectableMonsters, [curPlayer], []);

    await ctx.sendCard(card,
      `遇到了 ${monster.name}!\n请选择出战的精灵: \n${monsterList}`);
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
