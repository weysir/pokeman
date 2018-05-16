const rtm = require('bearychat')
  .rtm;
const ObjectID = require('mongodb')
  .ObjectID;
const player = require('./player');
const error = require('./error');
const pokecard = require('../pokecard/generatorRegistry');
const pokecardConstants = require('../pokecard/constants');

const specieses = {
  MONSTER_PIKACHU: {
    type: pokecardConstants.MONSTER_PIKACHU,
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
    type: pokecardConstants.MONSTER_PSYDUCK,
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
    type: pokecardConstants.MONSTER_DOGE,
    name: '神烦狗',
    blood: 200,
    skills: {
      eyeKilling: {
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
    type: pokecardConstants.SPECIAL_BEAR,
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
  getSpecieseById: id => {
    return specieses[id];
  },
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
      type: species.type,
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

    const monsters = curPlayer.monsters;
    const card = await pokecard(pokecardConstants.COMMAND_MONSTER_LIST,
      monsters, [curPlayer], []);

    await ctx.sendCard(card);
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
