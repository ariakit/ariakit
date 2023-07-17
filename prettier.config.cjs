/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require("prettier-plugin-tailwindcss")],
  tailwindConfig: "./tailwind.config.cjs",
};
