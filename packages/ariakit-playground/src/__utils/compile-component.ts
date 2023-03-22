import { compileModule } from "./compile-module.js";

export function compileComponent(
  code: string,
  filename: string,
  getModule?: (path: string) => any
) {
  const compiledModule = compileModule(code, filename, getModule);
  if (compiledModule.default) {
    return compiledModule.default;
  }
  const firstPascalCaseExport = Object.keys(compiledModule).find((key) =>
    /^[A-Z]/.test(key)
  );
  if (firstPascalCaseExport) {
    return compiledModule[firstPascalCaseExport];
  }
  return;
}
