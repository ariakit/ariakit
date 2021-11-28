const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  mode: "jit",
  purge: [
    "./components/**/*.{js,jsx,ts,tsx,css,scss}",
    "./styles/**/*.{css,scss}",
  ],
  darkMode: "class",
  theme: {
    colors: {
      "canvas-1": "var(--color-canvas-1)",
      "canvas-2": "var(--color-canvas-2)",
      "canvas-3": "var(--color-canvas-3)",
      "canvas-4": "var(--color-canvas-4)",
      "alpha-1": "var(--color-alpha-1)",
      "alpha-2": "var(--color-alpha-2)",
      "alpha-3": "var(--color-alpha-3)",
      "primary-1": "var(--color-primary-1)",
      "primary-2": "var(--color-primary-2)",
      "danger-1": "var(--color-danger-1)",
      "danger-2": "var(--color-danger-2)",
      "warn-1": "var(--color-warn-1)",
      "warn-2": "var(--color-warn-2)",

      "canvas-1-hover": "var(--color-canvas-1-hover)",
      "canvas-2-hover": "var(--color-canvas-2-hover)",
      "canvas-3-hover": "var(--color-canvas-3-hover)",
      "canvas-4-hover": "var(--color-canvas-4-hover)",
      "alpha-1-hover": "var(--color-alpha-1-hover)",
      "alpha-2-hover": "var(--color-alpha-2-hover)",
      "alpha-3-hover": "var(--color-alpha-3-hover)",
      "primary-1-hover": "var(--color-primary-1-hover)",
      "primary-2-hover": "var(--color-primary-2-hover)",
      "danger-1-hover": "var(--color-danger-1-hover)",
      "danger-2-hover": "var(--color-danger-2-hover)",
      "warn-1-hover": "var(--color-warn-1-hover)",
      "warn-2-hover": "var(--color-warn-2-hover)",
    },

    borderColor: {
      "canvas-1": "var(--color-canvas-1-border)",
      "canvas-2": "var(--color-canvas-2-border)",
      "canvas-3": "var(--color-canvas-3-border)",
      "canvas-4": "var(--color-canvas-4-border)",
      "alpha-1": "var(--color-alpha-1-border)",
      "alpha-2": "var(--color-alpha-2-border)",
      "alpha-3": "var(--color-alpha-3-border)",
      "primary-1": "var(--color-primary-1-border)",
      "primary-2": "var(--color-primary-2-border)",
      "danger-1": "var(--color-danger-1-border)",
      "danger-2": "var(--color-danger-2-border)",
      "warn-1": "var(--color-warn-1-border)",
      "warn-2": "var(--color-warn-2-border)",
    },

    textColor: {
      "canvas-1": "var(--color-canvas-1-text)",
      "canvas-2": "var(--color-canvas-2-text)",
      "canvas-3": "var(--color-canvas-3-text)",
      "canvas-4": "var(--color-canvas-4-text)",
      "alpha-1": "var(--color-alpha-1-text)",
      "alpha-2": "var(--color-alpha-2-text)",
      "alpha-3": "var(--color-alpha-3-text)",
      "primary-1": "var(--color-primary-1-text)",
      "primary-2": "var(--color-primary-2-text)",
      "danger-1": "var(--color-danger-1-text)",
      "danger-2": "var(--color-danger-2-text)",
      "warn-1": "var(--color-warn-1-text)",
      "warn-2": "var(--color-warn-2-text)",
    },

    minHeight: {
      1: "300px",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    plugin(({ addVariant, e }) => {
      [
        "checked",
        "current",
        "disabled",
        "expanded",
        "haspopup",
        "hidden",
        "invalid",
        "pressed",
        "readonly",
        "required",
        "selected",
      ].forEach((boolean) => {
        const selector = `aria-${boolean}`;
        addVariant(selector, ({ modifySelectors, separator }) =>
          modifySelectors(
            ({ className }) =>
              `[${selector}="true"].${e(`${selector}${separator}${className}`)}`
          )
        );

        const groupSelector = `group-aria-${boolean}`;
        addVariant(groupSelector, ({ modifySelectors, separator }) =>
          modifySelectors(
            ({ className }) =>
              `.group[aria-${boolean}="true"] .${e(
                `${groupSelector}${separator}${className}`
              )}`
          )
        );

        const peerSelector = `peer-aria-${boolean}`;
        addVariant(peerSelector, ({ modifySelectors, separator }) =>
          modifySelectors(
            ({ className }) =>
              `.peer[aria-${boolean}="true"] ~ .${e(
                `${peerSelector}${separator}${className}`
              )}`
          )
        );
      });

      const enumerables = {
        current: ["date", "location", "page", "step", "time"],
        haspopup: ["dialog", "grid", "listbox", "menu", "tree"],
        orientation: ["horizontal", "undefined", "vertical"],
      };

      for (const [attribute, values] of Object.entries(enumerables)) {
        for (const value of values) {
          const selector = `aria-${attribute}-${value}`;
          addVariant(selector, ({ modifySelectors, separator }) =>
            modifySelectors(
              ({ className }) =>
                `[aria-${attribute}="${value}"].${e(
                  `${selector}${separator}${className}`
                )}`
            )
          );

          const groupSelector = `group-aria-${attribute}-${value}`;
          addVariant(groupSelector, ({ modifySelectors, separator }) =>
            modifySelectors(
              ({ className }) =>
                `.group[aria-${attribute}="${value}"] .${e(
                  `${groupSelector}${separator}${className}`
                )}`
            )
          );

          const peerSelector = `peer-aria-${attribute}-${value}`;
          addVariant(peerSelector, ({ modifySelectors, separator }) =>
            modifySelectors(
              ({ className }) =>
                `.peer[aria-${attribute}="${value}"] ~ .${e(
                  `${peerSelector}${separator}${className}`
                )}`
            )
          );
        }
      }
    }),
  ],
};
