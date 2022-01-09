const path = require("path");

module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {
      config: path.join(__dirname, "tailwind.config.js"),
    },
    "postcss-combine-duplicated-selectors": {
      removeDuplicatedProperties: true,
    },
    "postcss-merge-selectors": {},
    "postcss-prettify": {},
  },
};
