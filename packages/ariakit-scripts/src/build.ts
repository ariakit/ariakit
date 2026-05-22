import { createRequire } from "node:module";
import path from "node:path";
import { transformAsync } from "@babel/core";
import { build as rolldownBuild } from "rolldown";
import type { Plugin } from "rolldown";
import { dts } from "rolldown-plugin-dts";

const require = createRequire(import.meta.url);
const solidPreset = require.resolve("babel-preset-solid");
const typescriptPreset = require.resolve("@babel/preset-typescript");

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function isSolidPackage(packageName?: string) {
  return packageName?.startsWith("@ariakit/solid-") ?? false;
}

function isReactPackage(packageName?: string) {
  return packageName?.startsWith("@ariakit/react-") ?? false;
}

function getExternal(packageJson: PackageJson) {
  const packages = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  });
  return (id: string) => {
    for (const packageName of packages) {
      if (id === packageName) return true;
      if (id.startsWith(`${packageName}/`)) return true;
    }
    return false;
  };
}

function solidPlugin(): Plugin {
  return {
    name: "ariakit-solid",
    async transform(code, id) {
      if (!/[jt]sx$/.test(id)) return;
      const result = await transformAsync(code, {
        babelrc: false,
        configFile: false,
        filename: path.basename(id),
        presets: [
          [solidPreset, { generate: "dom" }],
          [typescriptPreset, {}],
        ],
        sourceMaps: true,
      });
      if (!result?.code) {
        throw new Error(`Failed to transform ${id}`);
      }
      return {
        code: result.code,
        map: result.map,
      };
    },
  };
}

function reactClientPlugin(): Plugin {
  return {
    name: "ariakit-react-client",
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith(".js")) return;
      return `"use client";\n${code}`;
    },
  };
}

export async function build() {
  const cwd = process.cwd();
  const packageJson = (await import(path.join(cwd, "package.json"), {
    with: { type: "json" },
  }).then((module) => module.default)) as PackageJson;
  const plugins = isSolidPackage(packageJson.name) ? [solidPlugin()] : [];
  if (isReactPackage(packageJson.name)) {
    plugins.push(reactClientPlugin());
  }

  await rolldownBuild({
    cwd,
    input: "src/index.ts",
    external: getExternal(packageJson),
    platform: "neutral",
    output: {
      cleanDir: true,
      dir: "dist",
      format: "es",
      sourcemap: true,
    },
    plugins: [...plugins, ...dts({ cwd })],
  });
}
