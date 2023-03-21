const { join } = require("path");

module.exports = {
  plugins: {
    // [join(__dirname, "./postcss-page-plugin.js")]: {},
    // "postcss-import": {},
    tailwindcss: {
      config: join(__dirname, "./tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
