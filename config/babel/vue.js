const base = require("./base");

// For now Vue doesn't require any special babel configuration?
// We don't use Vue JSX so @vue/babel-preset-jsx shouldn't be necessary :thinking:
const vueConfig = base();

module.exports = vueConfig;
