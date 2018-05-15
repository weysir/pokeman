const bearychat = require('bearychat');
const config = require('./config');

const keyCurrentMessage = 'current_message';
const keyCurrentUser = 'current_user';

module.exports = class Context {
  constructor(db, currentHubot, rtm) {

    // standard state
    this.db = db;
    this.currentHubot = currentHubot;
    this.rtm = rtm;

    // custom state
    this.state = {};
  }

  // set state and return new context
  set(key, value) {
    const ctx = new Context(this.db, this.currentHubot, this.rtm);
    ctx.state = Object.assign({}, this.state);

    ctx.state[key] = value;

    return ctx;
  }

  get(key) {
    return this.state[key];
  }

  get currentUser() {
    return this.get(keyCurrentUser);
  }

  get currentMessage() {
    return this.get(keyCurrentMessage);
  }

  async fromMessage(message) {
    const fetchUser = async uid => {
      const resp = await bearychat.user.info({
        token: config.bearychat.token,
        user_id: uid,
      });

      return resp.json();
    };

    const currentUser = await fetchUser(message.uid);

    return this.set(keyCurrentMessage, message)
      .set(keyCurrentUser, currentUser);
  }
};
