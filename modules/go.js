const places = [
  {
    name: 'C 城草丛',
    desc: '',
  },
  {
    name: 'H 城水域',
    desc: '',
  },
  {
    name: 'J 城水域',
    desc: '',
  },
  {
    name: 'D 城草丛',
    desc: '',
  },
  {
    name: 'L 城空地',
    desc: '',
  },
];

const getPlaces = () => {
  return places;
};

const _outputPlace = (i, e) => {
  const c = String.fromCharCode(97 + i);
  return `${c}. ${e.name} (${e.desc})`;
};

const listPlaces = (ctx, args) => {
  if (args.length < 2) {
    return null;
  }

  let r = new Array();

  getPlaces().forEach((e, i) => {
    r.push(_outputPlace(i, e));
  });

  return r.join('\n');
};

