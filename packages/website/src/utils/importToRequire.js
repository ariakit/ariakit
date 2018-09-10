const importToRequire = string =>
  string
    .replace(/{([^}]+) as ([^}]+)}/g, "{$1: $2}")
    .replace(/import {([^}]+)} from ([^\s;]+);?/g, "const {$1} = require($2);")
    .replace(
      /import (.+) from ([^\s;]+);?/g,
      "const $1 = require($2).default || require($2);"
    );

module.exports = importToRequire;
