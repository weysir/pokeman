const error = require('./error')
const player = require('./player');
const playStateService = require('./playState')
  .service;
const monsterService = require('./monster')
  .service;

const charStartCode = 97;

const places = [
  {
    name: '霹雳草丛',
    desc: '大概率遇到皮卡丘',
  },
  {
    name: '啪嗒水域',
    desc: '大概率遇到可达鸭',
  },
  {
    name: '有很多小龙虾的水域',
    desc: '可能会遇到。。。你猜啊',
  },
  {
    name: '什么都没有的空地',
    desc: '可能什么都不会遇到，看心情吧',
  },
  {
    name: '卫星大厦 802',
    desc: '可能会遇到`超级无敌厉害`的`一熊宝宝`',
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
  if (Math.random() * 100 % 2 === 0) {
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

  playStateService.enterBattble(
      ctx,
      await playStateService.getByUser(ctx, currentUser),
      {});

  const monster = await getMaybeRandomMonster(ctx, args);

  if (monster === null) {
    return ctx.send(`在 ${place.name} 中没遇到精灵`);
  } else {
    const state = playStateService.getByUser(ctx, currentUser);
    playStateService.enterBattble(ctx, state, {enemy: monster, curMonster: null});
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
