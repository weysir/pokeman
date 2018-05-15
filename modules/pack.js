const error = require('./error');
const shopService = require('./shop')
  .service;
const playerRepository = require('./player')
  .repository;
const inventoryService = require('./inventory')
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
  const player = await playerRepository.getByUid(ctx, currentUser.id);
  if (!player) {
    return await error.playerNotFound(ctx);
  }

  let inventories = await inventoryService.listByUser(ctx, currentUser);

  ctx.send(`${player.name} 的背包:\n${_outputInventories(inventories)}`);
};

module.exports = {
  handler,
};

