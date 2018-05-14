const MongoClient = require('mongodb')
  .MongoClient;
const bearychat = require('bearychat');
const config = require('./config');
const rtm = require('bearychat').rtm;
const Context = require('./context');
const RTMClient = require('./rtm');

const player = require('./modules/player');

const setupDB = async () => {
  const client = await MongoClient.connect(config.database.uri, {
    useNewUrlParser: true
  });
  const db = client.db(config.database.name);

  return {
    client,
    db
  };
};

const rtmHandler = ctx => {
  return async data => {
    const message = JSON.parse(data);

    if (!rtm.message.isChatMessage(message)) {
      return;
    }

    if (rtm.message.isFromUser(message, ctx.currentUser)) {
      return;
    }

    if (ctx.rtm.isMentionMe(message.text, ctx.currentUser)) {

      // TODO parse command

      const respMessage = rtm
        .message
        .refer(message,
          `:ok_hand:`);

      ctx.rtm.send(respMessage);
    }
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
