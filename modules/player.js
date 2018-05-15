const rtm = require('bearychat')
  .rtm;
const bearychat = require('bearychat');
const ObjectID = require('mongodb')
  .ObjectID;
const config = require('../config');
const error = require('./error');

// 持久数据层
const repository = {
  collection: ctx => {
    return ctx.db.collection('players');
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

  updateById: async (ctx, id, m) => {
    return await repository.collection(ctx)
      .updateOne({
        _id: id
      }, {
        $set: m
      });

    return await repository.getById(ctx, id);
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
      })
      .toArray();
  }
};

// 逻辑层
// 脏活层，处理用户消息和展示炫酷的东西
const service = {
  getCurrentPlayer: async ctx => {
    const currentUser = ctx.currentUser;

    const info = await repository.getByUid(ctx, currentUser.id);

    if (!info) {
      await error.playerNotFound(ctx);
      return null;
    }

    return info;
  },

  info: async ctx => {

    const curPlayer = await service.getCurrentPlayer(ctx);

    if (!curPlayer) {
      return;
    }

    const currentMessage = ctx.currentMessage;

    const text = [
        `玩家信息`,
        `- 玩家名: ${curPlayer.name}`,
        `- 性别: ${curPlayer.gender}`,
        `- 钱包余额：${curPlayer.change}`
      ]
      .join('\n');
    const respMessage = rtm
      .message
      .refer(currentMessage, text);

    await ctx.rtm.send(respMessage);
  },

  setGender: async (ctx, gender) => {

    let curPlayer = await service.getCurrentPlayer(ctx);

    if (!curPlayer) {
      return;
    }

    if (gender !== '男' && gender !== '女') {
      await error.invalidPlayerGender(ctx);
      return;
    }

    curPlayer = await repository.updateById(ctx, curPlayer._id, {
      gender
    });

    const text = [
        `修改玩家性别为: \`${gender}\``,
        `玩家信息`,
        `- 玩家名: ${curPlayer.name}`,
        `- 性别: ${curPlayer.gender}`,
        `- 钱包余额：${curPlayer.change}`
      ]
      .join('\n');
    const respMessage = rtm
      .message
      .refer(ctx.currentMessage, text);

    await ctx.rtm.send(respMessage);
  },

  rename: async (ctx, name) => {
    let curPlayer = await service.getCurrentPlayer(ctx);

    if (!curPlayer) {
      return;
    }

    curPlayer = await repository.updateById(ctx, curPlayer._id, {
      name
    });

    const text = [
        `修改玩家名为: \`${name}\``,
        `玩家信息`,
        `- 玩家名: ${curPlayer.name}`,
        `- 性别: ${curPlayer.gender}`,
        `- 钱包余额：${curPlayer.change}`
      ]
      .join('\n');
    const respMessage = rtm
      .message
      .refer(ctx.currentMessage, text);

    await ctx.rtm.send(respMessage);
  },

  list: async ctx => {
    const curPlayer = await service.getCurrentPlayer(ctx);
    if (!curPlayer) {
      return;
    }

    const fetchMembers = async ctx => {
      const resp = await bearychat.user.list({
        token: config.bearychat.token
      });

      return resp.json();
    };

    const curUser = await ctx.currentUser;
    const players = await repository.listByTeamId(ctx, curUser.team_id);
    const members = await fetchMembers();

    const text = [
      '团队排行榜',
      ...players
      .sort((x, y) => y.change - x.change)
      .map((p, idx) => {
        const member = members.find(m => m.id === p.user_id);
        return `${idx + 1} - ${p.name}(${ctx.rtm.mention(member)}), 拥有 ${p.change} Xb`;
      })
    ].join('\n');

    const respMessage = rtm
      .message
      .refer(ctx.currentMessage, text);

    await ctx.rtm.send(respMessage);
  }
};

const handler = async (ctx, args) => {
  const currentMessage = ctx.currentMessage;

  if (args.length === 0) {
    await error.invalidCommand(ctx);
    return;
  }

  // 改名
  const rename = async (ctx, args) => {
    if (args.length !== 2) {
      await error.invalidCommand(ctx);
      return;
    }
    const name = args[1].trim();
    if (name.length === 0) {
      await error.invalidPlayerName(ctx);
      return;
    }
    await service.rename(ctx, name);
  };

  // 改变性别
  const setGender = async (ctx, args) => {
    if (args.length !== 2) {
      await error.invalidCommand(ctx);
      return;
    }
    const gender = args[1].trim();
    if (gender.length === 0) {
      await error.invalidPlayerName(ctx);
      return;
    }
    await service.setGender(ctx, gender);
  };

  switch (args[0]) {
    case 'info':
      await service.info(ctx);
      break;
    case 'list':
      await service.list(ctx);
      break;
    case 'rename':
      await rename(ctx, args);
      break;
    case 'set-gender':
      await setGender(ctx, args);
      break;
  }
};

module.exports = {
  repository,
  service,
  handler
};
