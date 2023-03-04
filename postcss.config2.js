const path = require("path");

module.exports = {
  plugins: {
    "postcss-import": {},
    // tailwindcss: {
    //   config: path.join(__dirname, "tailwind.config.js"),
    // },
    "postcss-combine-duplicated-selectors": {
      removeDuplicatedProperties: true,
    },
    "postcss-merge-selectors": {
      matchers: {
        active: {
          selectorFilter: /(:active|\[data-active\])/,
          promote: true,
        },
        focusVisible: {
          selectorFilter: /(:focus-visible|\[data-focus-visible\])/,
          promote: true,
        },
      },
    },
    "postcss-prettify": {},
  },
};
