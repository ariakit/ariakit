const path = require("node:path");

const tailwindConfig = path.join(__dirname, "tailwind.config.cjs");
const globalCss = path.join(__dirname, "website/app/global.css");
const tailwindPrelude = path.join(
  __dirname,
  "scripts/postcss-tailwind-prelude.cjs",
);

module.exports = {
  plugins: {
    "postcss-import": {},
    [tailwindPrelude]: {
      tailwindConfig,
      globalCss,
    },
    "@tailwindcss/postcss": {
      base: path.join(__dirname, "website"),
    },
    autoprefixer: {},
  },
};
