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
const pack = require('./modules/pack');
const monster = require('./modules/monster');
const go = require('./modules/go');
const attack = require('./modules/attack');
const player = require('./modules/player');
const playState = require('./modules/playState');

const setupDB = async () => {
  const client = await MongoClient.connect(config.database.uri, {
    useNewUrlParser: true
  });
  const db = client.db(config.database.name);

  return {
    client, db
  };
};

const getCommandHandler = async (ctx, command) => {
  const currentUser = ctx.currentUser;
  const state = await playState.service.getByUser(ctx, currentUser);
  if (state && !playState.service.isInNormal(state)) {
    return playState.handler;
  }

  switch (command) {
    case 'help':
      return help.handler;
    case 'init':
      return init.handler;
    case 'player':
      return player.handler;
    case 'mon':
      return monster.handler;
    case 'pack':
      return pack.handler;
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

const execCommand = async (ctx, commandHandler, args) => {
  let argv;
  if (commandHandler === playState.handler) {
    argv = args;
  } else {
    argv = args.splice(1);
  }

  if (commandHandler !== null) {
    // NOTE 去掉主命令(eg: player / shop)
    await commandHandler(ctx, argv);
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
    newCtx = await ctx.fromMessage(message);
    const commandHandler = await getCommandHandler(newCtx, command);

    await execCommand(newCtx,
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
  } catch (e) {
    client.close();
  }
};

main();
