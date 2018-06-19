const transformCode = string =>
  string
    .replace(/{([^}]+) as ([^}]+)}/g, "{$1: $2}")
    .replace(/import {([^}]+)} from ([^;]+);?/, "const {$1} = require($2);")
    .replace(
      /import (.+) from ([^;]+);?/g,
      "const $1 = require($2).default || require($2);"
    );

export default transformCode;
