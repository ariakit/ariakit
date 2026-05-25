import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

interface ReactAliasOptions {
  rootPath?: string;
  packages?: readonly string[];
}

interface ViteAlias {
  find: RegExp;
  replacement: string;
}

const reactPackages = ["react", "react-dom"] as const;

export const reactDedupe = [...reactPackages];

function resolvePkg(pkg: string, rootPath = process.cwd()) {
  const require = createRequire(join(rootPath, "package.json"));

  try {
    return dirname(require.resolve(`${pkg}/package.json`));
  } catch {
    let dir = dirname(require.resolve(pkg));
    while (!existsSync(join(dir, "package.json"))) {
      const parent = dirname(dir);
      if (parent === dir) throw new Error(`Could not resolve package: ${pkg}`);
      dir = parent;
    }
    return dir;
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getReactViteAliases({
  rootPath = process.cwd(),
  packages,
}: ReactAliasOptions = {}): ViteAlias[] {
  return (packages ?? reactPackages).map((pkg) => {
    const escapedPkg = escapeRegExp(pkg);
    return {
      find: new RegExp(`^${escapedPkg}($|/)`),
      replacement: `${resolvePkg(pkg, rootPath)}$1`,
    };
  });
}
