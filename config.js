const envPrefix = 'pokeman';

const getEnv = (name, defaultValue) => {
  const key = `${envPrefix}_${name}`.toUpperCase();
  return process.env[key] || defaultValue;
};

const config = {
  database: {
    uri: getEnv('database_uri'),
    name: getEnv('database_name')
  },
  bearychat: {
    token: getEnv('rtm_token')
  },
};

module.exports = config;
