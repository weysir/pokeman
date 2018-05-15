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
  playerNotFound: async ctx => {
    const text = [
      '当前玩家未初始化',
      '输入 `init` 初始化玩家'
    ].join('\n');

    await respondText(ctx, text);
  },
  invalidCommand: async ctx => {
    const text = '命令错误';

    await respondText(ctx, text);
  }
};
