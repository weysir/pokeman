const rtm = require('bearychat')
  .rtm;
const ObjectID = require('mongodb')
  .ObjectID;
const player = require('./player');
const error = require('./error');

const specieses = {
  MONSTER_PIKACHU: {
    name: '皮卡丘',
    blood: 200,
    skills: {
      coquetry: {
        name: '撒娇',
        atk: 50,
      },
      thunderbolt: {
        name: '十万伏特',
        atk: 10,
      },
    }
  },
  MONSTER_PSYDUCK: {
    name: '可达鸭',
    blood: 100,
    skills: {
      flashlight: {
        name: '闪光',
        atk: 30,
      },
      hypnotism: {
        name: '催眠',
        atk: 80,
      },
    }
  },
  MONSTER_DOGE: {
    name: '神烦狗',
    blood: 200,
    skills: {
      eyeKilling : {
        name: '眼神杀',
        atk: 99,
      },
      hack: {
        name: '40米大刀乱砍',
        atk: 200,
      },
    }
  },
  SPECIAL_BEAR: {
    name: '一熊',
    blood: 666,
    skills: {
      invincibility: {
        name: '无敌',
        atk: 888,
      },
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
