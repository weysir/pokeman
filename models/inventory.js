const ObjectID = require('mongodb')
  .ObjectID;

const col = 'inventories';

class Inventory {
  constructor(user_id, item_id, amount) {
    this.user_id = user_id;
    this.item_id = item_id;
    this.amount = amount;
  }
}

const getMultiByUid = async (ctx, uid) => {
  return await ctx.db.collection(col)
    .find({
      user_id: uid,
    });
};

const create = async (ctx, m) => {
  const id = ObjectID();

  const inventory = await ctx.db.collection(col)
    .insertOne({
      _id: id,
      ...m
    });

  return inventory.ops[0];
};

module.exports = {
  getMultiByUid,
  create,
};
