const model = require('../models/go');

const _outputPlace = (i, e) => {
  const c = String.fromCharCode(97 + i);
  return `${c}. ${e.name} (${e.desc})`;
};

const listPlaces = (ctx, args) => {
  if (args.length < 2) {
    return null;
  }

  let r = new Array();

  model.getPlaces().forEach((e, i) => {
    r.push(_outputPlace(i, e));
  });

  return r.join('\n');
};

