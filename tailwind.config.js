const path = require("path");
const plugin = require("tailwindcss/plugin");

const black = "hsl(204, 10%, 10%)";
const blackFade = "hsla(204, 10%, 10%, 75%)";
const white = "hsl(0, 0%, 100%)";
const whiteFade = "hsla(204, 3%, 97%, 75%)";

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
        text: black,
      },
      "black-fade": {
        DEFAULT: blackFade,
        text: blackFade,
      },
      white: {
        DEFAULT: white,
        text: white,
      },
      "white-fade": {
        DEFAULT: whiteFade,
        text: whiteFade,
      },
      link: {
        text: "hsl(204, 100%, 38%)",
        dark: {
          text: "hsl(204, 100%, 62%)",
        },
      },
      "canvas-1": {
        DEFAULT: "hsl(204, 20%, 94%)",
        hover: "hsl(204, 20%, 91%)",
        border: "hsl(204, 20%, 82%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204, 3%, 12%)",
          hover: "hsl(204, 3%, 10%)",
          border: "hsl(204, 3%, 24%)",
          text: white,
        },
      },
      "canvas-2": {
        DEFAULT: "hsl(204, 20%, 97%)",
        hover: "hsl(204, 20%, 94%)",
        border: "hsl(204, 20%, 85%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204, 3%, 16%)",
          hover: "hsl(204, 3%, 14%)",
          border: "hsl(204, 3%, 28%)",
          text: white,
        },
      },
      "canvas-3": {
        DEFAULT: "hsl(204, 20%, 99%)",
        hover: "hsl(204, 20%, 95%)",
        border: "hsl(204, 20%, 87%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204, 3%, 18%)",
          hover: "hsl(204, 3%, 16%)",
          border: "hsl(204, 3%, 30%)",
          text: white,
        },
      },
      "canvas-4": {
        DEFAULT: "hsl(204, 20%, 100%)",
        hover: "hsl(204, 20%, 96%)",
        border: "hsl(204, 20%, 88%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204, 3%, 20%)",
          hover: "hsl(204, 3%, 18%)",
          border: "hsl(204, 3%, 32%)",
          text: white,
        },
      },
      "canvas-5": {
        DEFAULT: "hsl(204, 20%, 100%)",
        hover: "hsl(204, 20%, 96%)",
        border: "hsl(204, 20%, 88%)",
        text: black,
        dark: {
          DEFAULT: "hsl(204, 3%, 24%)",
          hover: "hsl(204, 3%, 20%)",
          border: "hsl(204, 3%, 36%)",
          text: white,
        },
      },
      "alpha-1": {
        DEFAULT: "hsla(204, 10%, 89%, 50%)",
        hover: "hsla(204, 10%, 83%, 50%)",
        border: "hsla(204, 10%, 72%, 50%)",
        text: black,
        dark: {
          DEFAULT: "hsla(204, 5%, 8%, 50%)",
          hover: "hsla(204, 5%, 4%, 50%)",
          border: "hsla(204, 5%, 45%, 50%)",
          text: white,
        },
      },
      "alpha-2": {
        DEFAULT: "hsla(204, 10%, 100%, 0%)",
        hover: "hsla(204, 10%, 87%, 50%)",
        border: "currentColor",
        text: black,
        dark: {
          DEFAULT: "hsla(204, 5%, 8%, 0%)",
          hover: "hsla(204, 5%, 24%, 50%)",
          border: "currentColor",
          text: white,
        },
      },
      "alpha-3": {
        DEFAULT: "hsla(204, 10%, 100%, 75%)",
        hover: "hsla(204, 10%, 89%, 75%)",
        border: "hsla(204, 10%, 85%, 75%)",
        text: black,
        dark: {
          DEFAULT: "hsla(204, 5%, 24%, 50%)",
          hover: "hsla(204, 5%, 32%, 50%)",
          border: "hsla(204, 5%, 70%, 50%)",
          text: white,
        },
      },
      "primary-1": {
        DEFAULT: "hsl(204, 100%, 90%)",
        hover: "hsl(204, 100%, 86%)",
        border: "hsl(204, 100%, 72%)",
        text: "hsl(204, 100%, 30%)",
        dark: {
          DEFAULT: "hsl(204, 25%, 23%)",
          hover: "hsl(204, 25%, 27%)",
          border: "hsl(204, 25%, 36%)",
          text: "hsl(204, 100%, 80%)",
        },
      },
      "primary-2": {
        DEFAULT: "hsl(204, 100%, 40%)",
        hover: "hsl(204, 100%, 32%)",
        border: "hsl(204, 100%, 30%)",
        text: white,
        dark: {
          DEFAULT: "hsl(204, 100%, 40%)",
          hover: "hsl(204, 100%, 32%)",
          border: "hsl(204, 100%, 80%)",
          text: white,
        },
      },
      "danger-1": {
        DEFAULT: "hsl(357, 56%, 90%)",
        hover: "hsl(357, 56%, 86%)",
        border: "hsl(357, 56%, 72%)",
        text: "hsl(357, 100%, 30%)",
        dark: {
          DEFAULT: "hsl(357, 25%, 25%)",
          hover: "hsl(357, 25%, 29%)",
          border: "hsl(357, 25%, 38%)",
          text: "hsl(357, 100%, 90%)",
        },
      },
      "danger-2": {
        DEFAULT: "hsl(357, 56%, 50%)",
        hover: "hsl(357, 56%, 42%)",
        border: "hsl(357, 56%, 30%)",
        text: white,
        dark: {
          DEFAULT: "hsl(357, 56%, 50%)",
          hover: "hsl(357, 56%, 42%)",
          border: "hsl(357, 56%, 80%)",
          text: white,
        },
      },
      "warn-1": {
        DEFAULT: "hsl(43, 91%, 86%)",
        hover: "hsl(43, 91%, 81%)",
        border: "hsl(43, 91%, 55%)",
        text: "hsl(43, 100%, 20%)",
        dark: {
          DEFAULT: "hsl(43, 25%, 23%)",
          hover: "hsl(43, 25%, 27%)",
          border: "hsl(43, 25%, 36%)",
          text: "hsl(43, 100%, 90%)",
        },
      },
      "warn-2": {
        DEFAULT: "hsl(43, 91%, 62%)",
        hover: "hsl(43, 91%, 54%)",
        border: "hsl(43, 91%, 42%)",
        text: black,
        dark: {
          DEFAULT: "hsl(43, 75%, 50%)",
          hover: "hsl(43, 75%, 60%)",
          border: "hsl(43, 91%, 90%)",
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
          dark: color.dark && color.dark.text,
        };
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
      DEFAULT: "0 4px 6px rgba(0, 0, 0, 15%)",
      dark: "0 4px 6px rgba(0, 0, 0, 40%)",
      sm: "0 2px 3px rgba(0, 0, 0, 15%)",
      "sm-dark": "0 2px 3px rgba(0, 0, 0, 40%)",
      md: "0 8px 12px rgba(0, 0, 0, 15%)",
      "md-dark": "0 8px 12px rgba(0, 0, 0, 40%)",
      lg: "0 16px 24px rgba(0, 0, 0, 15%)",
      "lg-dark": "0 16px 24px rgba(0, 0, 0, 40%)",
    },
  },
  corePlugins: {
    backgroundOpacity: false,
    borderOpacity: false,
    textOpacity: false,
    dropShadow: false,
  },
  plugins: [
    plugin(({ addUtilities, addVariant, theme }) => {
      const shadows = theme("dropShadow");
      const shadowUtilities = Object.entries(shadows).reduce(
        (acc, [key, shadow]) => {
          acc[`.drop-shadow${key === "DEFAULT" ? "" : `-${key}`}`] = {
            filter: `drop-shadow(${shadow})`,
          };
          return acc;
        },
        {}
      );

      addUtilities(shadowUtilities);

      addUtilities({
        ".ariakit-outline": {
          outline: `2px solid ${theme("colors.primary-2.DEFAULT")}`,
          outlineOffset: "2px",
        },
        ".ariakit-outline-input": {
          outline: `2px solid ${theme("colors.primary-2.DEFAULT")}`,
        },
      });

      addVariant("enter", "&[data-enter]");
      addVariant("leave", "&[data-leave]");
      addVariant("active-item", "&[data-active-item]");

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
