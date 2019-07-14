// required by babel-preset-gatsby
// https://github.com/gatsbyjs/gatsby/blob/2a566a9e6b04963ba5797226d6da1cffc53f827d/packages/babel-preset-gatsby/src/index.js#L19
process.env.NODE_ENV = "test";

module.exports = require("../../.eslintrc");
