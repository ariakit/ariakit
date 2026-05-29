const path = require("node:path");

module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {
      config: path.join(__dirname, "./tailwind.config.cjs"),
    },
    autoprefixer: {},
  },
};
