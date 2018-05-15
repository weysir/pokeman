const rtm = require('bearychat')
  .rtm;
const ObjectID = require('mongodb')
  .ObjectID;
const player = require('./player');
const error = require('./error');

const specieses = {
  pikachu: {
    name: '皮卡丘',
    blood: 100,
    skills: {
      thunderbolt: {
        name: '十万伏特',
        atk: 10
      }
    }
  }
};

const service = {
  random: async ctx => {
    const id = ObjectID();

    const randomSpecies = (() => {
      const speciesIds = Object.keys(specieses);
      return () => {
        const speciesId = speciesIds[Math.floor(Math.random() *
          speciesIds.length)];
        const species = specieses[speciesId];

        return {
          speciesId,
          species,
        };
      };
    })();

    const {
      speciesId,
      species
    } = randomSpecies();

    return {
      _id: id,
      name: species.name,
      species: speciesId,
      exp: 0,
      blood: species.blood,
    };
  },
  list: async ctx => {
    const curPlayer = await player.service.getCurrentPlayer(ctx);

    if (!curPlayer) {
      return;
    }

    const text = [
      `玩家精灵列表`,
      ...curPlayer.monsters
      .map(m => {
        const species = specieses[m.species];

        return `- ${m.name}(${species.name}) [血量 \`${m.blood}\`] [经验 \`${m.exp}\`]`;
      })
    ].join('\n');

    const respMessage = rtm
      .message
      .refer(ctx.currentMessage, text);

    await ctx.rtm.send(respMessage);
  }
};

const handler = async (ctx, args) => {
  if (args.length === 0) {
    await error.invalidCommand(ctx);
    return;
  }

  switch (args[0]) {
    case 'list':
      await service.list(ctx);
      break;
  }
};

module.exports = {
  service,
  handler
};
