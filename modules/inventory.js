const rtm = require('bearychat')
  rtm;
const ObjectID = require('mongodb')
  .ObjectID;

const repository = {
  collection: ctx => {
    return ctx.db.collection('inventories');
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

  getMultiByUid: async (ctx, uId) => {
    return await repository.collection(ctx)
      .find({
        user_id: uId
      }).toArray();
  },

  getByUidItem: async (ctx, uId, itemIdx) => {
    return await repository.collection(ctx)
      .findOne({
        user_id: uId,
        item_idx: itemIdx,
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
  addItemFoyUser: async (ctx, user, itemIdx) => {
    let inventory = await repository.getByUidItem(ctx, user.id, itemIdx);

    if (!inventory) {
      inventory = await repository.create(ctx, {
        user_id: user.id,
        team_id: user.team_id,
        item_idx: itemIdx,
        amount: 1,
      });
    } else {
      inventory = await repository.updateById(
          ctx,
          inventory._id,
          {amount: inventory.amount + 1});
    }

    return inventory;
  }, 

  listByUser: async (ctx, user) => {
    let inventories = await repository.getMultiByUid(ctx, user.id);
    return inventories.filter((e) => {
      return e.amount > 0;
    });
  },

  getByUser: async (ctx, user) => {
    let inventories = await repository.getMultiByUid(ctx, user.id);
    if (!inventories) {
      inventory = await repository.create({
        user_id: user.id,
        team_id: user.team_id,
      });
    }
    return inventories;
  },

  getItemByUserIdx: async (ctx, user, idx) => {
    let inventories = await repository.getMultiByUid(ctx, user.id);
    inventories = inventories.filter((e) => {
      return e.amount > 0;
    });
    return inventories[idx];
  },

  useItem: async (ctx, user, idx) => {
    return await repository.collection(ctx)
      .updateOne({
        user_id: user.id,
        team_id: user.team_id,
        item_idx: idx,
      }, {
        $inc: { amount: -1 },
      });
  },
};

module.exports = {
  repository,
  service,
};
