const rtm = require('bearychat')
  .rtm;
const error = require('./error');
const playerRepository = require('./player')
  .repository;
const shopRepository = require('./shop')
  .repository;
const inventoryService = require('./inventory')
  .service;

const TYPE_HP = 0;
const TYPE_MP = 1;
const TYPE_BALL = 2;

const items = [
  {
    type: TYPE_HP,
    name: '草药',
    desc: '补充少量血量',
    price: 10,
    buff: 10,
  },
  {
    type: TYPE_HP,
    name: '高级草药',
    desc: '补充血量',
    price: 50,
    buff: 60,
  },
  {
    type: TYPE_HP,
    name: '辣条',
    desc: '补充大量血量',
    price: 100,
    buff: 150,
  },
  {
    type: TYPE_MP,
    name: 'PP 回复剂',
    desc: '回复少量技能点',
    price: 10,
    buff: 5,
  },
  {
    type: TYPE_MP,
    name: '维他柠檬',
    desc: '回复大量技能点',
    price: 30,
    buff: 15,
  },
  {
    type: TYPE_BALL,
    name: '普通精灵球',
    desc: '捕捉精灵必备道具',
    price: 20,
    buff: 20, // 基础概率
  },
  {
    type: TYPE_BALL,
    name: '高级精灵球',
    desc: '更容易地捕捉精灵',
    price: 60,
    buff: 40, // 基础概率
  }
];

const service = {

  getItems: () => {
    return items;
  },

  getItemByIdx: (idx) => {
    if (idx < 0 || idx >= items.length) {
      return null;
    }
    return items[idx];
  },
};

const charStartCode = 97;
const _outputItem = (i, e) => {
  const c = String.fromCharCode(charStartCode + i);
  return `${c}. ${e.name} (${e.desc}) - ${e.price}Xb`;
};

const itemsInfo = service.getItems().map((e, i) => {
  return _outputItem(i, e);
}).join('\n');

// shop list
const listItems = async (ctx, args) => {
  if (args.length > 1) {
    return await error.invalidCommand(ctx);
  }

  return await ctx.send(itemsInfo);
};

// shop buy [z]
const buyItem = async (ctx, args) => {
  if (args.length !== 2) {
    return await error.invalidCommand(ctx);
  }

  const currentUser = ctx.currentUser;

  const player = await playerRepository.getByUid(ctx, currentUser.id);
  if (!player) {
    return await error.playerNotFound(ctx);
  }

  const c = args[1];
  const idx = c.charCodeAt(0) - charStartCode;
  const item = getItemByIdx(idx);

  if (item === null) {
    return await error.itemNotFoundError(ctx);
  }

  if (player.change < item.price) {
    return ctx.send(`${player.name} 零钱不够噢`)
  }

  // TODO: player.change - item.price
  await playerRepostiory.updateById(ctx, player._id, {change: player.change - item.price});
  await inventoryService.addItemFoyUser(ctx, currentUser, idx);

  return ctx.send(`${player.name} 获得 ${item.name}x1，剩余 ${player.change - item.price} Xb`);
};

const handler = async (ctx, args) => {
  const subCommand = args[0];
  switch (subCommand) {
    case 'list':
      return await listItems(ctx, args);
    case 'buy':
      return await buyItem(ctx, args);
    default:
      return await error.invalidCommand(ctx);
  }
};

module.exports = {
  service,
  handler,
};
