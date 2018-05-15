const ObjectID = require('mongodb')
  .ObjectID;
const error = require('./error');
const monsterService = require('./monster')
  .service;
const playerRepository = require('./player')
  .repository;
const playerService = require('./player')
  .service;
const shopService = require('./shop')
  .service;
const inventoryService = require('./inventory')
  .service;

const charStartCode = 97;

const STATE_NORMAL = 0;
const STATE_IN_BATTLE= 1;
const STATE_CHOOSING_MONSTER_FOR_ITEM = 2;

const repository = {
  collection: ctx => {
    return ctx.db.collection('state');
  },

  create: async (ctx, m) => {
    const id = ObjectID();

    const result = await repository.collection(ctx)
      .insertOne({
        _id: id,
        ...m
      });
    return result.ops[0];
  },

  getByUid: async (ctx, uId) => {
    return await repository.collection(ctx)
      .findOne({
        user_id: uId
      });
  },

  updateById: async (ctx, id, m) => {
    return await repository.collection(ctx)
      .updateOne({
        _id: id,
      }, {
        $set: m
      });
  }
};

const service = {
  getByUser: async (ctx, user) => {
    let state = await repository.getByUid(ctx, user.id);
    if (!state) {
      state = await repository.create(ctx, {
        user_id: user.id,
        team_id: user.team_id,
        state: STATE_NORMAL,
      });
    }
    return state;
  },

  isInNormal: (state) => {
    return state.state === STATE_NORMAL;
  },

  chooseMonsterForItem: async (ctx, state, {itemIdx, inventoryIdx}) => {
    if (state.state === STATE_NORMAL || state.state === STATE_IN_BATTLE) {
      await repository.updateById(ctx, state._id,
          {state: STATE_CHOOSING_MONSTER_FOR_ITEM,
           data: { item_idx: itemIdx, inventory_idx: inventoryIdx }});
    }
  },

  enterBattble: (ctx, state) => {
   if (state.state === STATE_NORMAL) {
      await repository.updateById(ctx, state._id,
          {state: STATE_IN_BATTLE,
           data: {  }});
    }
  },

  resetNormal: async (ctx, state) => {
    await repository.updateById(ctx, state._id, {state: STATE_NORMAL});
  },

};

const chooseMonsterForItem = async (ctx, args) => {
  const currentUser = ctx.currentUser;
  const player = await playerRepository.getByUid(ctx, currentUser.id);
  if (!player) {
    return await error.playerNotFound(ctx);
  }

  const state = await service.getByUser(ctx, currentUser);
  const itemType = shopService.getItemByIdx(state.data.item_idx);

  const shouldChoose = () => {
    const monsters = player.monsters.map((m, i) => {
      const species = monsterService.getSpecieseById(m.species);
      const x = String.fromCharCode(i + charStartCode);
      return `${x}. ${m.name} [血量 \`${m.blood}/${species.blood}\`]`;
    }).join('\n');
    const x = String.fromCharCode(player.monsters.length + charStartCode);
    const cancelText = `${x}. 取消`;
    ctx.send(`请选择使用 ${itemType.name} 的精灵\n${monsters}\n${cancelText}`);
  };

  if (args.length !== 1) {
    return shouldChoose();
  }

  const c = args[0];
  const monsterIdx = c.charCodeAt(0) - charStartCode;

  if (monsterIdx > player.monsters.length) {
    return shouldChoose();
  }

  if (monsterIdx === player.monsters.length) {
    service.resetNormal(ctx, state);
    return ctx.send('取消选择');
  }

  const m = player.monsters[monsterIdx];
  if (!m) {
    return shouldChoose();
  }

  const newHp = Math.min(
      monsterService.getSpecieseById(m.species).blood,
      (m.blood + itemType.buff));

  await playerService.setMonsterHP(ctx, player, monsterIdx, newHp);
  await inventoryService.useItem(ctx, currentUser, state.data.inventory_idx);
  await service.resetNormal(ctx, state);

  return ctx.send(`对 ${player.monsters[monsterIdx].name} 使用 ${itemType.name}`);
};

const handler = async (ctx, args) => {
  const currentUser = ctx.currentUser;
  const state = await service.getByUser(ctx, currentUser);

  switch (state.state) {
    case STATE_IN_BATTLE:
      return ;

    case STATE_CHOOSING_MONSTER_FOR_ITEM:
      return await chooseMonsterForItem(ctx, args);

    default:
      return await error.invalidCommand(ctx);
  }
};

module.exports = {
  repository,
  service,
  handler,
};
