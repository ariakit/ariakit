const path = require("path");

module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {
      config: path.join(__dirname, "tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
