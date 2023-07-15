// Based on https://github.com/ritz078/transform/blob/ade2922f12616acde27616fd5841c2ed7e2fa815/pages/api/typescript-to-javascript.ts
import { transformFromAstSync } from "@babel/core";
import type { TransformOptions } from "@babel/core";
import { format } from "prettier";
import { parse, print } from "recast";
import _getBabelOptions from "recast/parsers/_babel_options.js";
import type { Overrides } from "recast/parsers/_babel_options.js";
import { parser as babelParser } from "recast/parsers/babel.js";

const getBabelOptions =
  _getBabelOptions as unknown as (typeof _getBabelOptions)["default"];

const parser = {
  parse(source: string, options: Overrides) {
    const babelOptions = getBabelOptions(options);
    babelOptions.plugins.push("typescript", "jsx");
    return babelParser.parse(source, babelOptions);
  },
};

export async function tsToJs(code: string) {
  const ast = parse(code, { parser });

  const options = {
    // recast stores metadata in AST nodes, so disable cloning will preserve the
    // original code style.
    cloneInputAst: false,
    code: false,
    ast: true,
    plugins: ["@babel/plugin-transform-typescript"],
    configFile: false,
  } satisfies TransformOptions;

  const result = transformFromAstSync(ast, code, options);
  if (!result?.ast) return code;

  return format(print(result.ast).code, { parser: "babel" });
}
