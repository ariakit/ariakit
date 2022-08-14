const path = require("path");
const plugin = require("tailwindcss/plugin");

const black = "hsl(204 10% 10%)";
const white = "hsl(204 20% 100%)";

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: [
    path.join(__dirname, "packages/website/components/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "packages/website/pages/**/*.{js,jsx,ts,tsx}"),
  ],
  darkMode: "class",
  theme: {
    colors: {
      black: {
        DEFAULT: black,
        border: black,
        text: black,
      },
      white: {
        DEFAULT: white,
        border: white,
        text: white,
      },
      current: {
        DEFAULT: "currentColor",
        border: "currentColor",
        text: "currentColor",
      },
      transparent: {
        DEFAULT: "transparent",
        border: "transparent",
        text: "transparent",
      },
      current: {
        DEFAULT: "currentColor",
        border: "currentColor",
        text: "currentColor",
      },
      link: {
        text: "hsl(204 100% 36%)",
        dark: {
          text: "hsl(204 100% 64%)",
        },
      },
      "canvas-1": {
        DEFAULT: "hsl(204 20% 94%)",
        hover: "hsl(204 20% 91%)",
        border: "hsl(204 20% 82%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204 3% 12%)",
          hover: "hsl(204 3% 10%)",
          border: "hsl(204 3% 22%)",
          text: white,
        },
      },
      "canvas-2": {
        DEFAULT: "hsl(204 20% 99%)",
        hover: "hsl(204 20% 95%)",
        border: "hsl(204 20% 87%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204 3% 14%)",
          hover: "hsl(204 3% 12%)",
          border: "hsl(204 3% 26%)",
          text: white,
        },
      },
      "canvas-3": {
        DEFAULT: "rgb(255 255 255)",
        hover: "hsl(204 20% 96%)",
        border: "hsl(204 20% 88%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204 3% 16%)",
          hover: "hsl(204 3% 14%)",
          border: "hsl(204 3% 28%)",
          text: white,
        },
      },
      "canvas-4": {
        DEFAULT: "rgb(255 255 255)",
        hover: "hsl(204 20% 96%)",
        border: "hsl(204 20% 88%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204 3% 18%)",
          hover: "hsl(204 3% 16%)",
          border: "hsl(204 3% 30%)",
          text: white,
        },
      },
      "canvas-5": {
        DEFAULT: "rgb(255 255 255)",
        hover: "hsl(204 20% 96%)",
        border: "hsl(204 20% 88%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204 3% 22%)",
          hover: "hsl(204 3% 18%)",
          border: "hsl(204 3% 34%)",
          text: white,
        },
      },
      "primary-1": {
        DEFAULT: "hsl(204 100% 90%)",
        hover: "hsl(204 100% 86%)",
        border: "hsl(204 100% 72%)",
        text: "hsl(204 100% 30%)",
        dark: {
          DEFAULT: "hsl(204 25% 23%)",
          hover: "hsl(204 25% 27%)",
          border: "hsl(204 25% 36%)",
          text: "hsl(204 100% 85%)",
        },
      },
      "primary-2": {
        DEFAULT: "hsl(204 100% 40%)",
        hover: "hsl(204 100% 32%)",
        border: "hsl(204 100% 30%)",
        foreground: "hsl(204 100% 35%)",
        text: white,
        dark: {
          DEFAULT: "hsl(204 100% 40%)",
          hover: "hsl(204 100% 32%)",
          border: "hsl(204 100% 80%)",
          foreground: "hsl(204 100% 58%)",
          text: white,
        },
      },
      "danger-1": {
        DEFAULT: "hsl(357 56% 90%)",
        hover: "hsl(357 56% 86%)",
        border: "hsl(357 56% 72%)",
        text: "hsl(357 100% 30%)",
        dark: {
          DEFAULT: "hsl(357 25% 25%)",
          hover: "hsl(357 25% 29%)",
          border: "hsl(357 25% 38%)",
          text: "hsl(357 100% 90%)",
        },
      },
      "danger-2": {
        DEFAULT: "hsl(357 56% 50%)",
        hover: "hsl(357 56% 42%)",
        border: "hsl(357 56% 30%)",
        foreground: "hsl(357 70% 48%)",
        text: white,
        dark: {
          DEFAULT: "hsl(357 56% 50%)",
          hover: "hsl(357 56% 42%)",
          border: "hsl(357 56% 80%)",
          foreground: "hsl(357 80% 68%)",
          text: white,
        },
      },
      "warn-1": {
        DEFAULT: "hsl(43 91% 86%)",
        hover: "hsl(43 91% 81%)",
        border: "hsl(43 91% 55%)",
        text: "hsl(43 100% 20%)",
        dark: {
          DEFAULT: "hsl(35 25% 20%)",
          hover: "hsl(35 25% 24%)",
          border: "hsl(35 25% 33%)",
          text: "hsl(35 100% 90%)",
        },
      },
      "warn-2": {
        DEFAULT: "hsl(43 91% 62%)",
        hover: "hsl(43 91% 54%)",
        border: "hsl(43 91% 42%)",
        foreground: "hsl(43 4% 42%)",
        text: black,
        dark: {
          DEFAULT: "hsl(43 75% 50%)",
          hover: "hsl(43 75% 60%)",
          border: "hsl(43 91% 90%)",
          foreground: "hsl(43 75% 50%)",
          text: black,
        },
      },
    },

    borderColor: (theme) => {
      const colors = theme("colors");
      return Object.entries(colors).reduce((acc, [key, color]) => {
        acc[key] = {
          DEFAULT: color.border,
          dark: color.dark && color.dark.border,
        };
        return acc;
      }, {});
    },

    textColor: (theme) => {
      const colors = theme("colors");
      const textColor = Object.entries(colors).reduce((acc, [key, color]) => {
        acc[key] = {
          DEFAULT: color.text,
        };
        if (color.foreground) {
          acc[key].foreground = color.foreground;
        }
        if (color.dark) {
          acc[key].dark = {
            DEFAULT: color.dark.text,
          };
          if (color.dark.foreground) {
            acc[key].dark.foreground = color.dark.foreground;
          }
        }
        return acc;
      }, {});

      return {
        ...textColor,
        disabled: {
          DEFAULT: "hsla(204, 10%, 10%, 30%)",
          dark: "hsla(0, 0%, 100%, 30%)",
        },
      };
    },

    fill: (theme) => theme("colors"),
    stroke: (theme) => theme("borderColor"),

    dropShadow: {
      sm: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))",
      "sm-dark": "drop-shadow(0 1px 1px rgb(0 0 0 / 0.15))",

      DEFAULT:
        "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))",
      dark: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.3)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))",

      md: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
      "md-dark":
        "drop-shadow(0 4px 3px rgb(0 0 0 / 0.21)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",

      lg: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
      "lg-dark":
        "drop-shadow(0 10px 8px rgb(0 0 0 / 0.12)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",

      xl: "drop-shadow(0 18px 10px rgb(0 0 0 / 0.04)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.1))",
      "xl-dark":
        "drop-shadow(0 18px 10px rgb(0 0 0 / 0.12)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.1))",

      "2xl": "drop-shadow(0 25px 20px rgb(0 0 0 / 0.15))",
      "2xl-dark": "drop-shadow(0 25px 20px rgb(0 0 0 / 0.34))",

      none: "drop-shadow(0 0 #0000)",
    },

    boxShadow: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "sm-dark": "0 1px 2px 0 rgb(0 0 0 / 0.15)",

      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      dark: "0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.1)",

      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "md-dark":
        "0 4px 6px -1px rgb(0 0 0 / 0.25), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "lg-dark":
        "0 10px 15px -3px rgb(0 0 0 / 0.25), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
      "xl-dark":
        "0 20px 25px -5px rgb(0 0 0 / 0.25), 0 8px 10px -6px rgb(0 0 0 / 0.08)",

      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      "2xl-dark": "0 25px 50px -12px rgb(0 0 0 / 0.75)",

      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      "inner-dark": "inset 0 2px 4px 0 rgb(0 0 0 / 0.15)",

      button: "inset 0 -1px 2px 0 rgb(0 0 0 / 0.05)",
      "button-dark":
        "0 1px 2px 0 rgb(0 0 0 / 0.15), inset 0 1px 0 0 rgb(255 255 255 / 0.05)",

      input:
        "inset 0 0 0 1px rgba(0 0 0 / 0.1), inset 0 2px 5px 0 rgba(0 0 0 / 0.05)",
      "input-dark":
        "inset 0 0 0 1px rgba(255 255 255 / 0.12), inset 0 -1px 0 0 rgba(255 255 255 / 0.05), inset 0 2px 5px 0 rgba(0 0 0 / 0.15)",

      none: "0 0 #0000",
    },
    fontFamily: {
      mono: ["Menlo", "monospace"],
    },
  },
  corePlugins: {
    backgroundOpacity: false,
    borderOpacity: false,
    textOpacity: false,
    dropShadow: false,
    boxShadow: false,
  },
  plugins: [
    plugin(({ addUtilities, addVariant, theme }) => {
      const dropShadow = theme("dropShadow");
      const dropShadowUtils = Object.entries(dropShadow).reduce(
        (acc, [key, shadow]) => {
          acc[`.drop-shadow${key === "DEFAULT" ? "" : `-${key}`}`] = {
            filter: shadow,
          };
          return acc;
        },
        {}
      );

      addUtilities(dropShadowUtils);

      const boxShadow = theme("boxShadow");
      const boxShadowUtils = Object.entries(boxShadow).reduce(
        (acc, [key, shadow]) => {
          acc[`.shadow${key === "DEFAULT" ? "" : `-${key}`}`] = {
            "box-shadow": `${shadow}`,
          };
          return acc;
        },
        {}
      );

      addUtilities(boxShadowUtils);

      addUtilities({
        ".ariakit-outline": {
          outline: `2px solid ${theme("colors.primary-2.DEFAULT")}`,
          outlineOffset: "2px",
        },
        ".ariakit-outline-input": {
          outline: `2px solid ${theme("colors.primary-2.DEFAULT")}`,
        },
      });

      addVariant(
        "supports-backdrop-blur",
        "@supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0))"
      );

      addVariant("enter", "&[data-enter]");
      addVariant("leave", "&[data-leave]");
      addVariant("active-item", "&[data-active-item]");
      addVariant("group-active-item", ":merge(.group)[data-active-item] &");

      addVariant("active", ["&:active", "&[data-active]"]);
      addVariant("ariakit-focus-visible", "&[data-focus-visible]");
      addVariant("focus-visible", ["&:focus-visible", "&[data-focus-visible]"]);
      addVariant("aria-invalid", '&[aria-invalid="true"]');
      addVariant("aria-disabled", '&[aria-disabled="true"]');
      addVariant("aria-selected", '&[aria-selected="true"]');
      addVariant("aria-expanded", '&[aria-expanded="true"]');
      addVariant("aria-checked", '&[aria-checked="true"]');
    }),
  ],
};
