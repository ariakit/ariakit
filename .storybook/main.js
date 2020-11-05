module.exports = {
  stories: [
    `${__dirname}/../packages/reakit/src/**/__examples__/**/*.story.ts`,
  ],

  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: require.resolve("postcss-loader"),
          options: {
            config: {
              path: __dirname,
            },
          },
        },
      ],
    });
    return config;
  },
};
