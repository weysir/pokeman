const ObjectID = require('mongodb')
  .ObjectID;

// collection name
const col = "players";

const getById = async (ctx, id) => {
  return await ctx.db.collection(col)
    .findOne({
      _id: id
    });
};

const create = async (ctx, m) => {
  const id = ObjectID();

  const player = await ctx.db.collection(col)
    .insertOne({
      _id: id,
      ...m
    });

  return player.ops[0];
};

module.exports = {
  getById,
  create,
};
