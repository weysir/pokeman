const rtm = require('bearychat').rtm;
const shopModel = require('../models/shop');
const playerModel = require('../models/player');
const inventoryModel = require('../models/inventory');

const charStartCode = 97;

const _outputItem = (i, e) => {
  const c = String.fromCharCode(charStartCode + i);
  return `${c}. ${e.name} (${e.desc}) - ${e.price}Xb`;
};

// shop list
const listItems = (ctx, args) => {
  if (args.length < 2) {
    ctx.rtm.send();
    return ;
  }
  let r = new Array();

  shopModel.getItems().forEach((e, i) => {
    r.push(_outputItem(i, e));
  });

  return r.join('\n');
};

// shop buy a
const buyItem = (ctx, args) => {
  const c = args[2];
  const idx = c.charCodeAt(0) - charStartCode;
  const item = shopModel.getItemByIdx(idx);
  if (item === null) {
    return null
  }

  const uid = ctx.message.uid;

  const player = playerModel.getByUid(uid);
  if (player === null) {
  }

};

const handler = (ctx, args) => {
  const subCommand = args[1];
  switch (subCommand) {
    case 'list':
      return listItems(ctx, args);
    case 'buy':
      return buyItem(ctx, args);
    default:
      return null;
  }
};

module.exports = {
  handler,
};
