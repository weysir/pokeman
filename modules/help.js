const rtm = require('bearychat')
  .rtm;
const error = require('./error');

const helpInfo =
  `HELP
命令：
- help: 帮助信息
- init: 初始化角色并分配一只随机的精灵

玩家:
- player info: 当前玩家信息
- player list: 当前团队玩家排行榜
- player rename [NAME]: 重命名当前玩家
- player set-gender [GENDER]: 设置当前玩家性别

精灵：
- mon list: 精灵列表

商店：
- shop list: 商品列表
- shop buy [ID]: 购买商品

草丛：
- go list: 场地列表
- go [ID]: 进入场地
`;

const handler = async (ctx, args) => {
  if (args.length > 0) {
    await error.invalidCommand(ctx);
    return;
  }

  const currentMessage = ctx.currentMessage;
  const currentUser = ctx.currentUser;
  const respMessage = rtm
    .message
    .refer(currentMessage, helpInfo);

  await ctx.rtm.send(respMessage);
};

module.exports = {
  handler,
};
