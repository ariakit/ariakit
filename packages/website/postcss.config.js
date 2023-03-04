const path = require("path");

module.exports = {
  plugins: {
    [path.join(__dirname, "./postcss-plugin.js")]: "postcss-plugin",
    "postcss-import": {},
    tailwindcss: {
      config: path.join(__dirname, "../../tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
