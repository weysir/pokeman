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

    return ctx;
  }

  get(key) {
    return this.state[key];
  }
};
