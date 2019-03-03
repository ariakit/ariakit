import * as React from "react";
import { transform } from "buble";
import reakitPaths from "./__reakit";

console.log(reakitPaths);

function importToRequire(code: string) {
  return code
    .replace(/{([^}]+) as ([^}]+)}/g, "{$1: $2}")
    .replace(/import {([^}]+)} from ([^\s;]+);?/g, "const {$1} = require($2);")
    .replace(
      /import (.+) from ([^\s;]+);?/g,
      "const $1 = require($2).default || require($2);"
    );
}

function compileComponent(code: string) {
  const { code: compiledCode } = transform(importToRequire(code), {
    objectAssign: "Object.assign"
  });
  const require = (path: string) => {
    if (path in reakitPaths) {
      return reakitPaths[path];
    }
    return undefined;
  };
  const fn = new Function("require", "React", compiledCode);
  return fn.bind(null, require, React)();
}

export function Preview(props: any) {
  const [rendered, setRendered] = React.useState<JSX.Element | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    if (!props.code) return;

    try {
      // const exampleComponent = compileComponent(code, evalInContext);
      const exampleComponent = compileComponent(props.code);
      setRendered(exampleComponent);
    } catch (e) {
      setError(e.toString());
      console.error(e); // eslint-disable-line no-console
    }
  }, [props.code]);

  return (
    <React.Fragment>
      {error ? (
        <pre style={{ fontSize: 14, color: "red" }}>{error}</pre>
      ) : (
        <div>{rendered}</div>
      )}
      <div />
    </React.Fragment>
  );
}
