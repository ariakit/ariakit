const path = require("path");
const plugin = require("tailwindcss/plugin");

const black = "hsl(204 10% 10%)";
const white = "hsl(204 20% 100%)";

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: [
    path.join(__dirname, "website/app/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "website/components/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "website/icons/**/*.{js,jsx,ts,tsx}"),
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        inherit: "inherit",
        black,
        white,
        gray: {
          50: "hsl(204 20% 99%)",
          100: "hsl(204 20% 96%)",
          150: "hsl(204 20% 94%)",
          200: "hsl(204 20% 91%)",
          250: "hsl(204 20% 88%)",
          300: "hsl(204 20% 82%)",
          350: "hsl(204 10% 70%)",
          400: "hsl(204 10% 50%)",
          450: "hsl(204 3% 34%)",
          500: "hsl(204 3% 30%)",
          550: "hsl(204 3% 28%)",
          600: "hsl(204 3% 26%)",
          650: "hsl(204 3% 22%)",
          700: "hsl(204 3% 18%)",
          750: "hsl(204 3% 16%)",
          800: "hsl(204 3% 14%)",
          850: "hsl(204 3% 12%)",
          900: "hsl(204 3% 10%)",
        },
        blue: {
          50: "hsl(204 100% 90%)",
          100: "hsl(204 100% 86%)",
          200: "hsl(204 100% 80%)",
          300: "hsl(204 100% 72%)",
          400: "hsl(204 100% 64%)",
          500: "hsl(204 100% 58%)",
          600: "hsl(204 100% 40%)",
          700: "hsl(204 100% 35%)",
          800: "hsl(204 100% 32%)",
          900: "hsl(204 100% 30%)",
        },
        red: {
          50: "hsl(357 100% 90%)",
          100: "hsl(357 56% 90%)",
          200: "hsl(357 56% 86%)",
          300: "hsl(357 56% 80%)",
          400: "hsl(357 56% 72%)",
          500: "hsl(357 56% 64%)",
          600: "hsl(357 56% 50%)",
          700: "hsl(357 56% 42%)",
          800: "hsl(357 100% 30%)",
          900: "hsl(357 56% 30%)",
        },
      },
    },

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
      mono: ["Menlo", "Consolas", "Courier New", "monospace"],
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
    plugin(({ addUtilities, matchUtilities, addVariant, theme }) => {
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
          outline: `2px solid ${theme("colors.blue.600")}`,
          outlineOffset: "2px",
        },
        ".ariakit-outline-input": {
          outline: `2px solid ${theme("colors.blue.600")}`,
        },
      });

      matchUtilities(
        {
          truncate: (value) =>
            value === 1
              ? null
              : {
                  overflow: "hidden",
                  display: "-webkit-box",
                  "-webkit-box-orient": "vertical",
                  "-webkit-line-clamp": value,
                },
        },
        { values: { DEFAULT: 1 } }
      );

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
