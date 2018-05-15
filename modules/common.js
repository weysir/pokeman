const rtm = require('bearychat')
  .rtm;

const unknownCommand = async (ctx) => {
  return await ctx.send('Unknown command');
};

module.exports = {
  unknownCommand,
};
