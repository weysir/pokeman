const error = require('./error');
const shop = require('./shop');
const shopService = require('./shop')
  .service;
const playerRepository = require('./player')
  .repository;
const inventoryService = require('./inventory')
  .service;
const monsterService = require('./monster')
  .service;
const playStateService = require('./playState')
  .service;
const pokecard = require('../pokecard/generatorRegistry');
const pokecardConstants = require('../pokecard/constants');

const charStartCode = 97;

const _outputInventories = (objs) => {
  return objs.map((e, i) => {
      const c = String.fromCharCode(charStartCode + i);
      const item = shopService.getItemByIdx(e.item_idx);
      return `${c}. ${item.name} x ${e.amount}`;
    })
    .join('\n');
};

const listPack = async (ctx, args) => {
  const currentUser = ctx.currentUser;
  const player = await playerRepository.getByUid(ctx, currentUser.id);
  if (!player) {
    await error.playerNotFound(ctx);
    return;
  }
  let inventories = await inventoryService.listByUser(ctx, currentUser);
  ctx.send(`${player.name} 的背包:\n${_outputInventories(inventories)}`);
};

const useItem = async (ctx, args) => {
  if (args.length !== 2) {
    await error.invalidCommand(ctx);
    return;
  }
  const c = args[1];
  const currentUser = ctx.currentUser;

  const player = await playerRepository.getByUid(ctx, currentUser.id);
  if (!player) {
    await error.playerNotFound(ctx);
    return;
  }

  const idx = c.charCodeAt(0) - charStartCode;
  const item = await inventoryService.getItemByUserIdx(ctx, currentUser, idx);
  const itemType = shopService.getItemByIdx(item.item_idx);

  if (!itemType) {
    await error.packItemNotFound(ctx);
    return;
  }

  if (itemType.type === shop.TYPE_BALL) {
    await error.canNotUseNow(ctx, itemType.name);
    return;
  }

  const monsters = player.monsters;
  const x = String.fromCharCode(player.monsters.length + charStartCode);
  const cancelText = `${x}. 取消`;
  await playStateService.chooseMonsterForItem(
    ctx,
    await playStateService.getByUser(ctx, currentUser), {
      itemIdx: item.item_idx,
      inventoryIdx: idx
    });

  const card = await pokecard(pokecardConstants.COMMAND_MONSTER_LIST,
    monsters, [player], []);

  await ctx.sendCard(card,
    `请选择使用 ${itemType.name} 的精灵\n${monsters.map((m, i) => {
    const species = monsterService.getSpecieseById(m.species);
    const x = String.fromCharCode(i + charStartCode);
    return `${x}. ${m.name} [血量 \`${m.blood}/${species.blood}\`]`;
  }).join('\n')}\n${cancelText}`
  );
};

const handler = async (ctx, args) => {
  if (args.length === 0) {
    return await listPack(ctx, args);
  } else {
    const subCommand = args[0];
    switch (subCommand) {
      case 'use':
        return await useItem(ctx, args);
      default:
        return await error.invalidCommand(ctx);
    }
  }
};

module.exports = {
  handler,
};
