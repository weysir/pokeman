const envPrefix = 'pokeman';

const getEnv = (name, defaultValue) => {
  const key = `${envPrefix}_${name}`.toUpperCase();
  return process.env[key] || defaultValue;
};

const config = {
  database: {
    uri: getEnv('database_uri', 'mongodb://127.0.0.1:27017'),
    name: getEnv('database_name', 'pokeman')
  },
  bearychat: {
    token: getEnv('rtm_token', '50c9387ad684f001b8156ec79b44eebb')
  },
};

module.exports = config;
