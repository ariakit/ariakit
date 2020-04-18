import * as React from "react";

const req = require.context(
  "../../packages/reakit/src",
  true,
  /__examples__\/([^/]+)$/,
  "lazy"
);

const allExamples: Record<string, React.FunctionComponent> = {};

for (const filename of req.keys()) {
  const [, component, , name] = filename.split("/");
  allExamples[`${component}-${name}`] = React.lazy(() => req(filename));
}

// eslint-disable-next-line no-console
console.log("Examples", Object.keys(allExamples));

export function getExample(name: string): React.FunctionComponent | undefined {
  return allExamples[name];
}
