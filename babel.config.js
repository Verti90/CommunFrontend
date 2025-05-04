module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            root: ['./'],
            alias: {
              '@auth': './AuthContext',
              '@app': './app',
              '@services': './services',
              '@utils': './utils',
              '@assets': './assets',
            },
          },
        ],
      ],
    };
  };  