const rtm = require('bearychat')
  .rtm;

const respondText = async (ctx, text) => {
  const currentMessage = ctx.currentMessage;
  const respMessage = rtm
    .message
    .refer(currentMessage, text);

  await ctx.rtm.send(respMessage);
};

module.exports = {
  invalidPlayerGender: async ctx => {
    const text = '玩家性别只允许为 `男` / `女`';

    await respondText(ctx, text);
  },
  invalidPlayerName: async ctx => {
    const text = '换个好听点的玩家名, 谢谢！';

    await respondText(ctx, text);
  },
  playerNotFound: async ctx => {
    const text = [
      '当前玩家未初始化',
      '输入 `init` 初始化玩家'
    ].join('\n');

    await respondText(ctx, text);
  },
  itemNotFound: async ctx => {
    const text = '无效的商品序号';
    await respondText(ctx, text);
  },
  packItemNotFound: async ctx => {
    const text = '无效的物品序号';
    await respondText(ctx, text);
  },
  placeItemNotFound: async ctx => {
    const text = '无效的草地序号';
    await respondText(ctx, text);
  },
  canNotUseNow: async (ctx, name) => {
    const text = `现在不能使用 ${name}`;
    await respondText(ctx, text);
  },
  invalidCommand: async ctx => {
    const text = '命令错误';

    await respondText(ctx, text);
  }
};
