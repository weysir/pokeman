const rtm = require('bearychat')
  .rtm;
const error = require('./error');

const helpInfo = `- help: 帮助信息
- init: 创建角色
- info: 玩家信息
- mon list: 精灵列表
- shop list: 商品列表
- shop buy [ID]: 购买商品
- go list: 场地列表
- go [ID]: 进入场地
- attach [ID]: 攻击对方
`;

const handler = async (ctx, args) => {
  if (args.length > 0) {
    return await error.invalidCommand(ctx);
  }

  const currentMessage = ctx.currentMessage;
  const currentUser = ctx.currentUser;
  const respMessage = rtm
    .message
    .refer(currentMessage, helpInfo);

  return await ctx.rtm.send(respMessage);
};

module.exports = {
  handler,
};
