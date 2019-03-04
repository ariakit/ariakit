export function importToRequire(code: string) {
  return (
    code
      // { a as b } => { a: b }
      .replace(/{([^}]+) as ([^}]+)}/g, "{$1: $2}")
      // import { a } from "a" => const { a } = require("b")
      .replace(
        /import {([^}]+)} from ([^\s;]+);?/g,
        "const {$1} = require($2);"
      )
      // import a from "a" => const a = require("a").default || require("a")
      .replace(
        /import ([\S]+) from ([^\s;]+);?/g,
        "const $1 = require($2).default || require($2);"
      )
      // import * as a from "a"
      .replace(
        /import \* as ([\S]+) from ([^\s;]+);?/g,
        "const $1 = require($2);"
      )
      // import a from "a" => const a = require("a").default || require("a")
      .replace(
        /import (.+),\s?{([^}]+)} from ([^\s;]+);?/g,
        [
          "const $1 = require($3).default || require($3);",
          "const {$2} = require($3);"
        ].join("\n")
      )
  );
}
