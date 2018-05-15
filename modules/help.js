const handler = (ctx, args) => {
  if (args.length > 1) {
    return null;
  }
  let r = new Array(); 
  r.push('- help: 帮助信息');
  r.push('- init: 创建角色');
  r.push('- info: 玩家信息');
  r.push('- mon list: 精灵列表');
  r.push('- shop list: 商品列表');
  r.push('- shop buy [ID]: 购买商品');
  r.push('- go list: 场地列表');
  r.push('- go [ID]: 进入场地');
  r.push('- attach [ID]: 攻击对方');
  return r.join('\n');
};

module.exports = {
  handler
};
