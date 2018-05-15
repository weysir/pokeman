const ObjectID = require('mongodb')
  .ObjectID;

const repository = {
  collection: ctx => {
    return ctx.db.collection("players");
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

  getById: async (ctx, id) => {
    return repository.collection(ctx)
      .findOne({
        _id: id
      });
  },

  updateById: async (ctx, id) => {
    return await repository.colleciton(ctx)
      .updateOne({
        _id: id
      }, {
        $set: m
      });
  },

  getByUid: async (ctx, uId) => {
    return await this.colleciton(ctx)
      .findOne({
        user_id: uId
      });
  },

  listByTeamId: async (ctx, teamId) => {
    return await this.collection(ctx)
      .find({
        team_id: teamId
      });
  }
};

const service = {
  getByUser: async (ctx, user) => {
    let player = await repository.getByUid(user.id);

    if (!player) {
      player = repository.create({
        name: user.name,
        user_id: user.id,
        team_id: user.team_id,
      });
    }

    return player;
  },

  listByTeam: async(ctx, team) => {
    let players = await repository.listByTeamId(team.id);

    return players;
  }
};

const handle = async (ctx, args, message) => {
  // TODO render view
};

module.exports = {
  repository,
  service
};
