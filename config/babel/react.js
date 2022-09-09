const base = require("./base");

const reactConfig = base();
reactConfig.presets.push(["@babel/preset-react", { runtime: "automatic" }]);

module.exports = reactConfig;
