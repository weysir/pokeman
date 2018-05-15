const playStateService = require('./playState')
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

const goPlace = async (ctx, args) => {
  const c = args[0];
  const idx = c.charCodeAt(0) - charStartCode;
  const place = getPlaceByIdx(idx);
  if (!place) {
    return await error.placeItemNotFound(ctx);
  }

  playStateService.enterBattble(
      ctx,
      await playStateService.getByUser(ctx, currentUser),
      {});

  return ctx.send(`进入 ${place.name}`);
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
