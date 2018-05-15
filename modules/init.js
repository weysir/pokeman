const rtm = require('bearychat')
  .rtm;
const player = require('./player');
const error = require('./error');

const handler = async (ctx, args) => {
  if (args.length !== 0) {
    await error.invalidCommand(ctx);
    return;
  }

  const curUser = ctx.currentUser;

  let curPlayer = await player.repository.getByUid(ctx, curUser.id);

  if (!curPlayer) {
    curPlayer = await player.repository.create(ctx, {
      name: curUser.name,
      user_id: curUser.id,
      team_id: curUser.team_id,
      gender: 'male',
      change: 100,
    });
  }

  // TODO 初始化精灵
  // TODO 初始化背包存货

  const curMessage = ctx.currentMessage;

  const text = [
    `初始化当前玩家`,
    `- 玩家名: ${curPlayer.name}`,
    `- 性别: ${curPlayer.gender}`,
    `- 钱包余额：${curPlayer.change}`
  ].join(`\n`);

  const respMessage = rtm
    .message
    .refer(curMessage, text);

  await ctx.rtm.send(respMessage);
};

module.exports = {
  handler
};
