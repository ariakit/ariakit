const { join } = require("path");

module.exports = {
  plugins: {
    tailwindcss: {
      config: join(__dirname, "./tailwind.config.cjs"),
    },
    autoprefixer: {},
  },
};
