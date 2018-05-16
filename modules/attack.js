const listAttack = (ctx, args) => {
};

const attack = (ctx, args) => {
};

const handler = (ctx, args) => {
  const subCommand = args[0];
  switch (subCommand) {
    case 'list':
      return listAttack(ctx, args);
    default:
      return attack(ctx, args);
  }
};

module.exports = {
  handler,
};
