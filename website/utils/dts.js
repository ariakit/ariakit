import { builtinModules } from "module";
import { readPackageUpSync } from "read-pkg-up";
import { rollup } from "rollup";
import dtsPlugin from "rollup-plugin-dts";
import ts from "typescript";

/** @type {ts.CompilerOptions} */
const options = {
  declaration: true,
  emitDeclarationOnly: true,
  incremental: false,
};

/**
 * @param {string} source
 * @param {string} filename
 */
export async function dts(source, filename) {
  const host = ts.createCompilerHost(options);

  const res = ts.resolveModuleName(source, filename, options, host);
  if (!res.resolvedModule) return "";

  const resolvedSource = res.resolvedModule.resolvedFileName;

  const pkg = readPackageUpSync({ cwd: resolvedSource });

  if (!pkg) return "";

  const deps = Object.keys(pkg.packageJson.dependencies || {})
    .concat(Object.keys(pkg.packageJson.peerDependencies || {}))
    .concat(builtinModules);

  const bundle = await rollup({
    input: resolvedSource,
    plugins: [dtsPlugin({ respectExternal: true, compilerOptions: options })],
    external: (id) => deps.includes(id),
  });
  const result = await bundle.generate({});

  return result.output[0].code;
}
