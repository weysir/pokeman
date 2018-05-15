const rtm = require('bearychat')
  .rtm;
const { unknownCommand } = require('./common');
const playerRepository = require('../modules/player')
  .repository;
const shopModel = require('../models/shop')
const playerRepostiory = require('../modules/player')
  .repository;
const shopRepository = require('../modules/shop')
  .repository;
const inventoryService = require('../modules/inventory')
  .service;

const charStartCode = 97;

const _outputItem = (i, e) => {
  const c = String.fromCharCode(charStartCode + i);
  return `${c}. ${e.name} (${e.desc}) - ${e.price}Xb`;
};

const itemsInfo = shopModel.getItems().map((e, i) => {
  return _outputItem(i, e);
}).join('\n');

const itemNotFoundError = async (ctx) => {
  return await ctx.send('Item not found');
};

const playerNotFoundError = async (ctx) => {
  return await ctx.send('Player not found');
};

// shop list
const listItems = async (ctx, args) => {
  if (args.length > 1) {
    return await unknownCommand(ctx);
  }

  return await ctx.send(itemsInfo);
};

// shop buy [z]
const buyItem = async (ctx, args) => {
  if (args.length !== 2) {
    return await unknownCommand(ctx);
  }

  const currentUser = ctx.currentUser;

  const player = await playerRepository.getByUid(ctx, currentUser.id);
  if (!player) {
    return await playerNotFoundError(ctx);
  }

  const c = args[1];
  const idx = c.charCodeAt(0) - charStartCode;
  const item = shopModel.getItemByIdx(idx);

  if (item === null) {
    return await itemNotFoundError(ctx);
  }

  if (player.change < item.price) {
    return ctx.send(`@<=${currentUser.id}=> 零钱不够噢`)
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
      return await unknownCommand(ctx);
  }
};

module.exports = {
  handler,
};
