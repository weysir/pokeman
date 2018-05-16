const ObjectID = require('mongodb')
  .ObjectID;
const error = require('./error');
const player = require('./player');
const monster = require('./monster');
const shopService = require('./shop')
  .service;
const inventoryService = require('./inventory')
  .service;

const charStartCode = 97;

const STATE_NORMAL = 0;
const STATE_IN_BATTLE= 1;
const STATE_CHOOSING_MONSTER_FOR_ITEM = 2;

const repository = {
  collection: ctx => {
    return ctx.db.collection('state');
  },

  create: async (ctx, m) => {
    const id = ObjectID();

    const result = await repository.collection(ctx)
      .insertOne({
        _id: id,
        ...m
      });
    return result.ops[0];
  },

  getByUid: async (ctx, uId) => {
    return await repository.collection(ctx)
      .findOne({
        user_id: uId
      });
  },

  updateById: async (ctx, id, m) => {
    return await repository.collection(ctx)
      .updateOne({
        _id: id,
      }, {
        $set: m
      });
  }
};

const service = {
  getByUser: async (ctx, user) => {
    let state = await repository.getByUid(ctx, user.id);
    if (!state) {
      state = await repository.create(ctx, {
        user_id: user.id,
        team_id: user.team_id,
        state: STATE_NORMAL,
      });
    }
    return state;
  },

  isInNormal: (state) => {
    return state.state === STATE_NORMAL;
  },

  chooseMonsterForItem: async (ctx, state, {itemIdx, inventoryIdx}) => {
    if (state.state === STATE_NORMAL || state.state === STATE_IN_BATTLE) {
      await repository.updateById(ctx, state._id,
          {state: STATE_CHOOSING_MONSTER_FOR_ITEM,
           data: { item_idx: itemIdx, inventory_idx: inventoryIdx }});
    }
  },

  enterBattble: async (ctx, state, { enemy, curMonster }) => {
    if (state.state === STATE_NORMAL) {
      await repository.updateById(ctx, state._id,
          {state: STATE_IN_BATTLE,
           data: { enemy, curMonster } });
    }
  },

  changeMonster: async (ctx, state, idx) => {
    if (state.state === STATE_IN_BATTLE) {
      await repository.updateById(ctx, state._id, { 'data.curMonster': idx });
    }
  },

  attack: async (ctx, state, hp) => {
    if (state.state === STATE_IN_BATTLE) {
      await repository.collection(ctx)
        .updateOne({
          _id: state._id,
        }, {
          '$inc': { 'data.enemy.blood': -hp }
        });
    }
  },

  defend: async (ctx, state, hp) => {
    if (state.state === STATE_IN_BATTLE) {
      const curPlayer = await player.service.getCurrentPlayer(ctx);
      const monster = curPlayer.monsters[state.data.curMonster];
      const newHP = Math.max(0, monster.blood - hp);
      await player.service.setMonsterHP(ctx, curPlayer, state.data.curMonster, newHP);
    }
  },

  resetNormal: async (ctx, state) => {
    await repository.updateById(ctx, state._id, {state: STATE_NORMAL});
  },

};

const chooseMonsterForItem = async (ctx, args) => {
  const currentUser = ctx.currentUser;
  const curPlayer = await player.repository.getByUid(ctx, currentUser.id);
  if (!curPlayer) {
    return await error.playerNotFound(ctx);
  }

  const state = await service.getByUser(ctx, currentUser);
  const itemType = shopService.getItemByIdx(state.data.item_idx);

  const shouldChoose = () => {
    const monsters = curPlayer.monsters.map((m, i) => {
      const species = monster.service.getSpecieseById(m.species);
      const x = String.fromCharCode(i + charStartCode);
      return `${x}. ${m.name} [血量 \`${m.blood}/${species.blood}\`]`;
    }).join('\n');
    const x = String.fromCharCode(curPlayer.monsters.length + charStartCode);
    const cancelText = `${x}. 取消`;
    ctx.send(`请选择使用 ${itemType.name} 的精灵\n${monsters}\n${cancelText}`);
  };

  if (args.length !== 1) {
    return shouldChoose();
  }

  const c = args[0];
  const monsterIdx = c.charCodeAt(0) - charStartCode;

  if (monsterIdx > curPlayer.monsters.length) {
    return shouldChoose();
  }

  if (monsterIdx === curPlayer.monsters.length) {
    service.resetNormal(ctx, state);
    return ctx.send('取消选择');
  }

  const m = curPlayer.monsters[monsterIdx];
  if (!m) {
    return shouldChoose();
  }

  const newHp = Math.min(
      monster.service.getSpecieseById(m.species).blood,
      (m.blood + itemType.buff));

  await player.service.setMonsterHP(ctx, curPlayer, monsterIdx, newHp);
  await inventoryService.useItem(ctx, currentUser, state.data.inventory_idx);
  await service.resetNormal(ctx, state);

  return ctx.send(`对 ${curPlayer.monsters[monsterIdx].name} 使用 ${itemType.name}`);
};

const getSkills = (m) => {
  const ms = monster.service.getSpecieseById(m.species);
  return Object.values(ms.skills);
};

const selectMonster = async (ctx, state, args) => {
  if (args.length !== 1) {
    return await error.invalidCommand(ctx);
  }

  const curPlayer = await player.service.getCurrentPlayer(ctx);
  // TODO: player init ?

  const c = args[0];
  const idx = c.charCodeAt(0) - charStartCode;
  const m = curPlayer.monsters[idx];
  if (!m) {
    const selectableMonsters = curPlayer.monsters.filter((m) => {
      return m.blood > 0;
    });
    const monsterList = selectableMonsters.map((m, i) => {
      const x = String.fromCharCode(i + charStartCode);
      return `${x}. ${m.name} (血量 \`${m.blood}\`)`
    }).join('\n');

    return ctx.send(`遇到了 ${state.data.enemy.name}!\n请选择出战的精灵: \n${monsterList}`);
  } else {
    await service.changeMonster(ctx, state, idx);
    const skills = getSkills(m);
    const skillList = skills.map((e, i) => {
      const x = String.fromCharCode(i + charStartCode);
      return `${x}. ${e.name}`;
    });
    return ctx.send(`决定就是你的 ${m.name}! \n请选择技能 \n ${skillList}`);
  }

};

const fightLoop = async (ctx, state, args) => {
  const curPlayer = await player.service.getCurrentPlayer(ctx);
  const curMonster = curPlayer.monsters[state.data.curMonster];
  if (args.length !== 1) {
    const skills = getSkills(curMonster);
    const skillList = skills.map((e, i) => {
      const x = String.fromCharCode(i + charStartCode);
      return `${x}. ${e.name}`;
    });
    return ctx.send(`无效操作，请选择技能 \n ${skillList}`);
  }

  const c = args[0]; const idx = c.charCodeAt(0) - charStartCode;
  const skills = getSkills(curMonster);
  const skill = skills[idx];
  const skillList = skills.map((e, i) => {
    const x = String.fromCharCode(i + charStartCode);
    return `${x}. ${e.name}`;
  });
  if (!skill) {
    return ctx.send(`无效操作，请选择技能 \n ${skillList}`);
  }

  const enemySkills = getSkills(state.data.enemy);
  const enemySkill = enemySkills[0];

  const enemySkillAtk = enemySkill.atk + Math.floor(Math.random() * 20);
  const skillAtk = skill.atk + Math.floor(Math.random() * 20);

  await service.attack(ctx, state, skillAtk);

  await ctx.send(`我方 ${curMonster.name} 使用了 ${skill.name}`);
  const eLeft = state.data.enemy.blood - skillAtk;
  if (eLeft <= 0) {
    await service.resetNormal(ctx, state);
    await ctx.send(`敌方 ${state.data.enemy.name} 已经阵亡，胜利`);
    return;
  }

  await service.defend(ctx, state, enemySkillAtk);
  const mLeft = curMonster.blood - enemySkillAtk;
  setTimeout(() => {
    ctx.send(`敌方 ${state.data.enemy.name} 使用了 ${enemySkill.name}`);
    if (mLeft <= 0) {
      service.resetNormal(ctx, state);
      ctx.send(`我方 ${curMonster.name} 已经阵亡，失败`);
    }}, 500);
  if (mLeft <= 0) {
    return;
  }

  setTimeout(() => {
    ctx.send(`我方 ${curMonster.name} 剩余血量 ${mLeft}\n` +
             `敌方 ${state.data.enemy.name} 剩余血量 ${eLeft}\n` +
             `请选择技能:\n ${skillList}`)}, 1000);
};

const fight = async (ctx, state, args) => {
  const currentUser = ctx.currentUser;
  if (state.data.curMonster === null) {
    // should select monster
    return await selectMonster(ctx, state, args);
  }

  return await fightLoop(ctx, state, args);
};

const handler = async (ctx, args) => {
  const currentUser = ctx.currentUser;
  const state = await service.getByUser(ctx, currentUser);

  switch (state.state) {
    case STATE_IN_BATTLE:
      return await fight(ctx, state, args);

    case STATE_CHOOSING_MONSTER_FOR_ITEM:
      return await chooseMonsterForItem(ctx, args);

    default:
      return await error.invalidCommand(ctx);
  }
};

module.exports = {
  repository,
  service,
  handler,
};
