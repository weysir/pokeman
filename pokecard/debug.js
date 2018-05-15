const fs = require('fs');
const generate = require('./generatorRegistry');
const constants = require('./constants');

(async () => {
  const command = constants.COMMAND_MONSTER_CATCH;
  const result = await generate(
    command,
    [{ name: 'pikachu', type: 'MONSTER_PIKACHU', blood: 100, exp: 100 }, { name: 'pikachu', type: 'MONSTER_PIKACHU', blood: 100, exp: 100 }],
    [{ name: 'dorayx', money: '$1000', gender: 'male', avatarUrl: 'https://static.bearychat.com/FpMCD66rdo9ZkV4CjlHQKNEiSejo' }, { name: 'dorayx', money: '$1000', gender: 'male', avatarUrl: 'https://static.bearychat.com/FpMCD66rdo9ZkV4CjlHQKNEiSejo' }],
    [true, false]
  );
  result.getStream().pipe(fs.createWriteStream(`debug-${command}.jpg`))
})();
