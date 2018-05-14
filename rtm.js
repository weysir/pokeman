const rtm = require('bearychat')
  .rtm;
const WebSocket = require('ws');

const newDefaultMessageHandler = async data => {
  const message = JSON.parse(data);

  if (!rtm.message.isChatMessage(message)) {
    return;
  }

  if (rtm.message.isFromUser(message, me)) {
    return;
  }

  if (isMentionMe(message.text, me)) {

    const respMessage = rtm
      .message
      .refer(message,
        `:ok_hand:`);
    send(respMessage);
  }
};

const mentionRe = new RegExp('@<=(=[A-Za-z0-9]+)=> ');

module.exports = class RTMClient {
  constructor(currentUser, token) {
    this.callId = 0;
    this.token = token;
    this.currentUser = currentUser;
    this.ws = null;
  }

  keepAlive() {
    const interval = 5000; // 5 seconds to keep alive

    setInterval(() => {
      this.send({
        type: rtm.message.type.PING
      });
    }, 5000);
  }

  send(message) {
    if (!message.call_id) {
      message.call_id = ++this.callId;
    }

    this.ws.send(JSON.stringify(message));
  }

  isMentionMe(text, me) {
    const mentions = mentionRe.exec(text);

    if (mentions === null) {
      return false;
    }

    for (const mention of mentions) {
      const mentionUid = mention.substring(3, mention.length - 3);
      if (mentionUid === me.id) {
        return true;
      }
    }

    return false;
  };

  async start(messageHandler) {
    const resp = await rtm.start({
      token: this.token,
    });
    const {
      ws_host,
      user
    } = await resp.json();

    this.ws = new WebSocket(ws_host);

    this.ws.on('open', this.keepAlive.bind(this));
    this.ws.on('message', messageHandler);
  }
};
