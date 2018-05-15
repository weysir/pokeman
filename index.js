const MongoClient = require('mongodb')
  .MongoClient;
const bearychat = require('bearychat');
const config = require('./config');
const rtm = require('bearychat').rtm;
const Context = require('./context');
const RTMClient = require('./rtm');

const help = require('./modules/help');
const init = require('./modules/init');
const shop = require('./modules/shop');
const monster = require('./modules/monster');
const go = require('./modules/go');
const attack = require('./modules/attack');
const player = require('./modules/player');

const setupDB = async () => {
  const client = await MongoClient.connect(config.database.uri, {
    useNewUrlParser: true
  });
  const db = client.db(config.database.name);

  return {
    client, db
  };
};

const getCommandHandler = command => {
  switch (command) {
    case 'help':
      return help.handler;
    case 'init':
      return init.handler;
    case 'player':
      return player.handler;
    case 'monster':
      return monster.handler;
    case 'shop':
      return shop.handler;
    case 'go':
      return go.handler;
    case 'attack':
      return attack.handler;
    default:
      return null;
  }
};

const parseArgs = (ctx, message) => {
  const text = message.text;
  const args = text.trim().split(' ');

  if (ctx.rtm.isMentionMe(message.text, ctx.currentHubot)) {
    args.shift();
  }

  return args;
};

const execCommand = async(ctx, commandHandler, args) => {
  if (commandHandler !== null) {
    // NOTE 去掉主命令(eg: player / shop)
    await commandHandler(ctx, args.splice(1));
  }
};

const rtmHandler = ctx => {
  return async data => {
    const message = JSON.parse(data);

    if (!rtm.message.isChatMessage(message)) {
      return;
    }

    if (rtm.message.isFromUser(message, ctx.currentHubot)) {
      return;
    }

    if (!rtm.message.isP2P(message) &&
        !ctx.rtm.isMentionMe(message.text, ctx.currentHubot)) {
      return;
    }

    const args = parseArgs(ctx, message);
    const command = args[0];
    const commandHandler = getCommandHandler(command);

    await execCommand(await ctx.fromMessage(message),
                      commandHandler,
                      args);
  };
};

const fetchCurrentUser = async () => {
  const resp = await bearychat.user.me({
    token: config.bearychat.token,
  });

  return resp.json();
};

const main = async () => {

  const {
    client,
    db
  } = await setupDB();

  try {
    const rtmClient = new RTMClient(config.bearychat.token);
    const currentHubot = await fetchCurrentUser();
    const ctx = new Context(db, currentHubot, rtmClient);

    rtmClient.start(rtmHandler(ctx));
  } finally {
    client.close();
  }
};

main();
