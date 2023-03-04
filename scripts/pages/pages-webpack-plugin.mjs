// @ts-check
import { writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { getDepsFromFile } from "./get-deps-from-file.mjs";
import { getPageEntryFiles } from "./get-page-entry-files.mjs";
import { getPageName } from "./get-page-name.mjs";
import { getPageSourceFiles } from "./get-page-source-files.mjs";

/**
 * @param {string} [buildDir]
 */
function getBuildDir(buildDir) {
  return buildDir || join(process.cwd(), ".pages");
}

/**
 * @param {string} buildDir
 * @param {import("./types").Page[]} pages
 */
function processStuff(buildDir, pages) {
  const entryFiles = pages.flatMap((page) =>
    getPageEntryFiles(page.sourceContext, page.sourceRegExp)
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
    .map(
      (path) => `  "${path}": () => import("${path.replace(/\.[tj]sx?$/, "")}")`
    )
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
    console.log("apply");
    const pages = this.pages;

    processStuff(this.buildDir, pages);

    compiler.hooks.compilation.tap("PagesWebpackPlugin", (compilation) => {
      if (!compiler.watchMode) return;
      for (const page of pages) {
        const { sourceContext, sourceRegExp } = page;
        compilation.contextDependencies.add(sourceContext);
        getPageEntryFiles(sourceContext, sourceRegExp).forEach((file) => {
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
        console.log("removed page", getPageName(file));
        processStuff(this.buildDir, pages);
        return;
      }

      if (modifiedFiles.size === 1) {
        const page = pages.find((page) =>
          modifiedFiles.has(page.sourceContext)
        );
        if (page) {
          console.log("modified page", page.sourceContext);
          processStuff(this.buildDir, pages);
          return;
        }
      }

      for (const file of modifiedFiles) {
        if (pages.some((page) => file === page.sourceContext)) continue;
        if (!pages.some((page) => file.includes(page.sourceContext))) continue;
        console.log("modified page", getPageName(file));
        processStuff(this.buildDir, pages);
      }
    });
  }
}

export default PagesWebpackPlugin;
