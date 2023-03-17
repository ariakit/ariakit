// @ts-check
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { getDepsFromFile } from "./get-deps-from-file.mjs";
import { getPageEntryFiles } from "./get-page-entry-files.mjs";
import { getPageSourceFiles } from "./get-page-source-files.mjs";

/**
 * @param {string} [buildDir]
 */
function getBuildDir(buildDir) {
  return buildDir || join(process.cwd(), ".pages");
}

/**
 * @param {string} path
 */
function pathToImport(path) {
  return path.replace(/\.[tj]sx?$/, "");
}

/**
 * @param {string} buildDir
 * @param {import("./types").Page[]} pages
 */
function writeFiles(buildDir, pages) {
  const entryFiles = pages.flatMap((page) =>
    getPageEntryFiles(page.sourceContext)
  );

  const deps = entryFiles.reduce(
    /** @param {Record<string, string>} deps */
    (deps, file) => ({ ...deps, ...getDepsFromFile(file) }),
    {}
  );

  const depsFile = join(buildDir, "deps.ts");

  const depsContents = `export default {\n${Object.keys(deps)
    .map((key) => `  "${key}": () => import("${key}") as unknown`)
    .join(",\n")}\n};\n`;

  writeFileSync(depsFile, depsContents);

  const imports = [...new Set(entryFiles.flatMap(getPageSourceFiles))];
  const importsFile = join(buildDir, "pages.ts");

  const importsContents = `export default {\n${imports
    .map((path) => `  "${path}": () => import("${pathToImport(path)}")`)
    .join(",\n")}\n};\n`;

  writeFileSync(importsFile, importsContents);
}

class PagesWebpackPlugin {
  /**
   * @param {object} options
   * @param {string} options.buildDir The directory where the build files should
   * be placed.
   * @param {import("./types").Page[]} options.pages
   */
  constructor(options) {
    this.buildDir = getBuildDir(options.buildDir);
    this.pages = options.pages;
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    const pages = this.pages;

    writeFiles(this.buildDir, pages);

    compiler.hooks.compilation.tap("PagesWebpackPlugin", (compilation) => {
      if (!compiler.watchMode) return;
      for (const page of pages) {
        compilation.contextDependencies.add(page.sourceContext);
        getPageEntryFiles(page.sourceContext).forEach((file) => {
          compilation.fileDependencies.add(file);
          compilation.contextDependencies.add(dirname(file));
        });
      }
    });

    compiler.hooks.watchRun.tap("PagesWebpackPlugin", (compiler) => {
      const { modifiedFiles, removedFiles } = compiler;
      if (!modifiedFiles) return;
      if (!removedFiles) return;

      for (const file of removedFiles) {
        // removed page: getPageName(file)
        writeFiles(this.buildDir, pages);
        return;
      }

      if (modifiedFiles.size === 1) {
        const page = pages.find((page) =>
          modifiedFiles.has(page.sourceContext)
        );
        if (page) {
          // modified page: page.sourceContext
          writeFiles(this.buildDir, pages);
          return;
        }
      }

      for (const file of modifiedFiles) {
        if (pages.some((page) => file === page.sourceContext)) continue;
        if (!pages.some((page) => file.includes(page.sourceContext))) continue;
        // modified page: getPageName(file)
        writeFiles(this.buildDir, pages);
        return;
      }
    });
  }
}

export default PagesWebpackPlugin;
