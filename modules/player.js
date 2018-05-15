const rtm = require('bearychat')
  .rtm;
const ObjectID = require('mongodb')
  .ObjectID;
const error = require('./error');

// 持久数据层
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

// 逻辑层
// 脏活层，处理用户消息和展示炫酷的东西
const service = {
  info: async ctx => {

    const currentMessage = ctx.currentMessage;
    const currentUser = ctx.currentUser;

    const info = await repository.getByUid(ctx, currentUser.id);

    if (!info) {
      await error.playerNotFound(ctx);
      return;
    }

    const text = [
        `玩家信息`,
        `- 玩家名: ${info.name}`,
        `- 性别: ${info.gender}`,
        `- 钱包余额：${info.change}`
      ]
      .join('\n');
    const respMessage = rtm
      .message
      .refer(currentMessage, text);

    await ctx.rtm.send(respMessage);
  },

  listByTeam: async (ctx, team) => {
    let players = await repository.listByTeamId(ctx, team.id);

    return players;
  }
};

const handler = async (ctx, args) => {
  const currentMessage = ctx.currentMessage;

  if (args.length === 0) {
    await error.invalidCommand(ctx);
    return;
  }

  switch (args[0]) {
    case 'info':
      await service.info(ctx);
  }
};

module.exports = {
  repository,
  service,
  handler
};
