import camelCase from "lodash/camelCase";
import { transform } from "buble";
import splitExampleCode from "react-styleguidist/lib/utils/splitExampleCode";
import importToRequire from "./importToRequire";

const compileComponent = (code, config, evalInContext, theme) => {
  const { code: compiledCode } = transform(importToRequire(code), config);
  const { example, head } = splitExampleCode(compiledCode);
  if (
    /(var Provider|createElement\( Provider)/.test(example) ||
    !theme ||
    theme === "none"
  ) {
    return evalInContext(example)();
  }
  const componentCode = example.replace(head, "").replace(/^\s*;\s*/, "");
  const componentCodeWithProvider = componentCode.replace(
    /^return \(([\s\S]*)\);$/,
    `return (React.createElement(Provider, { theme: ${camelCase(
      theme
    )}Theme }, $1));`
  );
  return evalInContext(`${head};\n${componentCodeWithProvider}`)();
};

export default compileComponent;
