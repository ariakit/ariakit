import { transform } from "buble";
import splitExampleCode from "react-styleguidist/lib/utils/splitExampleCode";
import importToRequire from "./importToRequire";

const compileComponent = (code, config, evalInContext) => {
  const { code: compiledCode } = transform(importToRequire(code), config);
  const { example } = splitExampleCode(compiledCode);
  return evalInContext(example)();
};

export default compileComponent;
