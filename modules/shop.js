const model = require('../models/shop');

const _outputItem = (i, e) => {
  const c = String.fromCharCode(97 + i);
  return `${c}. ${e.name} (${e.desc}) - ${e.price}Xb`;
}

const listItems = (ctx, args) => {
  if (args.length < 2) {
    return null;
  }
  let r = new Array();

  model.getItems().forEach((e, i) => {
    r.push(_outputItem(i, e));
  });

  return r.join('\n');
}

const buyItem = (ctx, args) => {};

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
  handler
};
