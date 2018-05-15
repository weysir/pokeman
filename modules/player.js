const rtm = require('bearychat')
  .rtm;
const ObjectID = require('mongodb')
  .ObjectID;

const repository = {
  collection: ctx => {
    return ctx.db.collection("players");
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

  getById: async (ctx, id) => {
    return await repository.collection(ctx)
      .findOne({
        _id: id
      });
  },

  updateById: async (ctx, id) => {
    return await repository.collection(ctx)
      .updateOne({
        _id: id
      }, {
        $set: m
      });
  },

  getByUid: async (ctx, uId) => {
    return await repository.collection(ctx)
      .findOne({
        user_id: uId
      });
  },

  listByTeamId: async (ctx, teamId) => {
    return await repository.collection(ctx)
      .find({
        team_id: teamId
      });
  }
};

const service = {
  getByUser: async (ctx, user) => {

    let player = await repository.getByUid(ctx, user.id);

    if (!player) {
      player = await repository.create({
        name: user.name,
        user_id: user.id,
        team_id: user.team_id,
      });
    }

    return player;
  },

  listByTeam: async (ctx, team) => {
    let players = await repository.listByTeamId(team.id);

    return players;
  }
};

const handler = async (ctx, args) => {
  const currentMessage = ctx.currentMessage;
  const currentUser = ctx.currentUser;

  if (args.length === 0) {
    // TODO 统一返回未知命令方法

    const respMessage = rtm
      .message
      .refer(currentMessage, 'Unknown command');

    return await ctx.rtm.send(respMessage);
  }

  switch (args[0]) {
    case 'info':
      const info = await service.getByUser(ctx, currentUser);
      const respMessage = rtm
        .message
        .refer(currentMessage, info);

      return await ctx.rtm.send(respMessage);
  }
};

module.exports = {
  repository,
  service,
  handler
};
