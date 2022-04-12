// @ts-check
const spawn = require("cross-spawn");

spawn.sync("npm", ["run", "build"], { stdio: "inherit" });
spawn.sync("npx", ["changeset", "publish"], { stdio: "inherit" });
