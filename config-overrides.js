const path = require('path');

module.exports = {
  webpack: (config, env) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '/') // Set alias for src folder
      }
    };
    return config;
  }
};
