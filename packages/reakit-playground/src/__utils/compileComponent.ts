import * as React from "react";
import * as ReactDOM from "react-dom";
import { transform } from "buble";
import deps from "../__deps";
import { importToRequire } from "./importToRequire";

export function compileComponent(
  code: string,
  depsMap?: Record<string, any>
): JSX.Element {
  const defaultDeps = {
    react: React,
    "react-dom": ReactDOM
  };
  const fullCode = `{
${importToRequire(code)}
if (typeof Example !== "undefined") {
  return <Example />;
}
}`;
  const req = (path: keyof typeof deps) => {
    if (path in deps) {
      return deps[path];
    }
    if (depsMap && path in depsMap) {
      return depsMap[path];
    }
    if (path in defaultDeps) {
      return defaultDeps[path as keyof typeof defaultDeps];
    }
    throw new Error(`Unable to resolve path to module '${path}'.`);
  };
  const { code: compiledCode } = transform(fullCode, { objectAssign: true });
  // eslint-disable-next-line no-new-func
  const fn = new Function("require", "React", compiledCode);
  return fn(req, React);
}
