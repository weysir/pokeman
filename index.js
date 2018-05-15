const MongoClient = require('mongodb')
  .MongoClient;
const bearychat = require('bearychat');
const config = require('./config');
const rtm = require('bearychat').rtm;
const Context = require('./context');
const RTMClient = require('./rtm');

const help = require('./modules/help');
const init = require('./modules/init');
const info = require('./modules/info');
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
    case 'info':
      return info.handler;
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

  if (ctx.rtm.isMentionMe(message.text, ctx.currentUser)) {
    args.shift();
  }

  return args;
};

const execCommand = (ctx, commandHandler, args) => {
  if (commandHandler !== null) {
    return commandHandler(ctx, args);
  }
  return null;
}

const wrapWithMention = (message, returnText) => {
  return `@<=${message.uid}=>\n${returnText}`;
}

const rtmHandler = ctx => {
  return async data => {
    const message = JSON.parse(data);

    if (!rtm.message.isChatMessage(message)) {
      return;
    }

    if (rtm.message.isFromUser(message, ctx.currentUser)) {
      return;
    }

    if (!rtm.message.isP2P(message) &&
          !ctx.rtm.isMentionMe(message.text, ctx.currentUser)) {
      return;
    }

    const args = parseArgs(ctx, message);
    const command = args[0]
    const commandHandler = getCommandHandler(command);
    let rv = execCommand(ctx, commandHandler, args);

    if (rv === '' || rv === null) {
      rv = '命令错误';
    }
    const response = wrapWithMention(message, rv);
    const respMessage = rtm.message.reply(message, response);
    ctx.rtm.send(respMessage);
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
    const currentUser = await fetchCurrentUser();
    const rtmClient = new RTMClient(currentUser, config.bearychat.token);

    const ctx = new Context();
    ctx.db = db;
    ctx.currentUser = currentUser;
    ctx.rtm = rtmClient;

    rtmClient.start(rtmHandler(ctx));
  } finally {
    client.close();
  }
};

main();
