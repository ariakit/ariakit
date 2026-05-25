// @ts-nocheck
const path = require("node:path");

const black = "black";
const white = "white";

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: [
    path.join(__dirname, "blog/**/*.{ts,tsx,md}"),
    path.join(__dirname, "guide/**/*.{ts,tsx,md}"),
    path.join(__dirname, "components/**/*.{ts,tsx,md}"),
    path.join(__dirname, "examples/**/*.{ts,tsx,md}"),
    path.join(__dirname, "website/app/**/*.{ts,tsx}"),
    path.join(__dirname, "website/components/**/*.{ts,tsx}"),
    path.join(__dirname, "website/icons/**/*.{ts,tsx}"),
  ],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        current: "currentColor",
        inherit: "inherit",
        transparent: "transparent",
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
          400: "hsl(204 8% 50%)",
          450: "hsl(204 4% 40%)",
          500: "hsl(204 4% 32%)",
          550: "hsl(204 4% 28%)",
          600: "hsl(204 4% 24%)",
          650: "hsl(204 4% 20%)",
          700: "hsl(204 4% 16%)",
          750: "hsl(204 4% 14%)",
          800: "hsl(204 4% 12%)",
          850: "hsl(204 4% 10%)",
          900: "hsl(204 4% 8%)",
          950: "hsl(204 4% 6%)",
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
      sm: "0 1px 1px rgb(0 0 0 / 0.05)",
      "sm-dark": "0 1px 1px rgb(0 0 0 / 0.15)",

      DEFAULT: "0 1px 2px rgb(0 0 0 / 0.1), 0 1px 1px rgb(0 0 0 / 0.06)",
      dark: "0 1px 2px rgb(0 0 0 / 0.3), 0 1px 1px rgb(0 0 0 / 0.06)",

      md: "0 4px 3px rgb(0 0 0 / 0.07), 0 2px 2px rgb(0 0 0 / 0.06)",
      "md-dark": "0 4px 3px rgb(0 0 0 / 0.21), 0 2px 2px rgb(0 0 0 / 0.06)",

      lg: "0 10px 8px rgb(0 0 0 / 0.04), 0 4px 3px rgb(0 0 0 / 0.1)",
      "lg-dark": "0 10px 8px rgb(0 0 0 / 0.12), 0 4px 3px rgb(0 0 0 / 0.1)",

      xl: "0 18px 10px rgb(0 0 0 / 0.04), 0 8px 5px rgb(0 0 0 / 0.1)",
      "xl-dark": "0 18px 10px rgb(0 0 0 / 0.12), 0 8px 5px rgb(0 0 0 / 0.1)",

      "2xl": "0 25px 20px rgb(0 0 0 / 0.15)",
      "2xl-dark": "0 25px 20px rgb(0 0 0 / 0.34)",

      none: "0 0 #0000",
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
  },
  plugins: [
    require("tailwindcss-animate"),
    {
      handler: ({ addUtilities, addVariant, theme }) => {
        addUtilities({
          ".ariakit-outline": {
            outline: `2px solid ${theme("colors.blue.600")}`,
            outlineOffset: "2px",
          },
          ".ariakit-outline-input": {
            outline: `2px solid ${theme("colors.blue.600")}`,
            outlineOffset: "-1px",
          },
        });

        addVariant(
          "supports-backdrop-blur",
          "@supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0))",
        );

        addVariant("enter", "&[data-enter]");
        addVariant("leave", "&[data-leave]");
        addVariant("active-item", "&[data-active-item]");
        addVariant("group-active-item", ":merge(.group)[data-active-item] &");

        addVariant("active", ["&:active", "&[data-active]"]);
        addVariant("ariakit-focus-visible", "&[data-focus-visible]");
        addVariant("focus-visible", [
          "&:focus-visible",
          "&[data-focus-visible]",
        ]);
        addVariant("aria-invalid", '&[aria-invalid="true"]');
      },
    },
  ],
};
