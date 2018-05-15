const { unknownCommand } = require('./common');
const shopService = require('../modules/shop')
  .service;
const playerRepository = require('../modules/player')
  .repository;
const inventoryService = require('../modules/inventory')
  .service;

const charStartCode = 97;

const _outputInventories = (objs) => {
  return objs.map((e, i) => {
    const c = String.fromCharCode(charStartCode + i);
    const item = shopService.getItemByIdx(e.item_idx);
    return `${c}. ${item.name} x ${e.amount}`;
  }).join('\n');
}; 

const handler = async (ctx, args) => {
  if (args.length > 0) {
    return await unknownCommand(ctx);
  }
  const currentUser = ctx.currentUser;

  let inventories = await inventoryService.listByUser(ctx, currentUser);

  ctx.send(`@<=${currentUser.id}=> 的背包:\n${_outputInventories(inventories)}`);
};

module.exports = {
  handler,
};

