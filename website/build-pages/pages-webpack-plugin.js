import { existsSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import chalk from "chalk";
import fse from "fs-extra";
import { camelCase, groupBy } from "lodash-es";
import invariant from "tiny-invariant";
import { getPageEntryFiles } from "./get-page-entry-files.js";
import { getPageExternalDeps } from "./get-page-external-deps.js";
import { getPageName } from "./get-page-name.js";
import { getPageSections } from "./get-page-sections.js";
import { getPageSourceFiles } from "./get-page-source-files.js";

/** @param {string} [buildDir] */
function getBuildDir(buildDir) {
  return buildDir || join(process.cwd(), ".pages");
}

/** @param {string} path */
function pathToImport(path) {
  return path.replace(/\.ts(x?)$/, ".js$1");
}

/**
 * @param {string} buildDir
 * @param {import("./types.js").Page[]} pages
 */
function writeFiles(buildDir, pages) {
  performance.mark("writeFiles:start");

  const entryFiles = pages.flatMap((page) =>
    getPageEntryFiles(page.sourceContext)
  );
  const sourceFiles = entryFiles.reduce(
    /** @param {Record<string, string[]>} acc */ (acc, file) => {
      acc[file] = getPageSourceFiles(file);
      return acc;
    },
    {}
  );

  // deps.ts
  /** @type {Record<string, string>} */
  let deps = {};

  for (const file of entryFiles) {
    const fileDeps = getPageExternalDeps(file);
    deps = { ...deps, ...fileDeps };
  }

  const depsFile = join(buildDir, "deps.ts");

  const depsContents = `export default {\n${Object.keys(deps)
    .map((key) => `  "${key}": () => import("${key}") as unknown`)
    .join(",\n")}\n};\n`;

  writeFileSync(depsFile, depsContents);

  // examples.js
  const sourceFilesWithoutAppDir = Object.values(sourceFiles)
    .flat()
    .filter((file) => !file.startsWith(process.cwd()));
  const examples = [...new Set(sourceFilesWithoutAppDir)];
  const examplesFile = join(buildDir, "examples.js");

  const examplesContents = `import { lazy } from "react";\n\nexport default {\n${examples
    .map((path) => `  "${path}": lazy(() => import("${pathToImport(path)}"))`)
    .join(",\n")}\n};\n`;

  writeFileSync(examplesFile, examplesContents);

  // index.json and contents.json
  const markdownFiles = entryFiles.filter((file) => file.endsWith(".md"));

  const indexFile = join(buildDir, "index.json");
  const contentsFile = join(buildDir, "contents.json");

  const meta = markdownFiles.map((file) => {
    const page = pages.find((page) => {
      const context = Array.isArray(page.sourceContext)
        ? page.sourceContext
        : [page.sourceContext];
      return context.some((context) => file.startsWith(context));
    });
    if (!page) throw new Error(`Could not find page for file: ${file}`);
    return getPageSections(file, page.slug, page.getGroup);
  });

  const categories = groupBy(meta, (page) => page.category);
  const contents = meta.flatMap((page) => page.sections);

  const index = Object.entries(categories).reduce(
    /** @param {Record<string, Omit<(typeof meta)[0], "sections">[]>} acc */
    (acc, [category, pages]) => {
      acc[category] = pages.map(({ sections, ...page }) => page);
      return acc;
    },
    {}
  );

  writeFileSync(indexFile, JSON.stringify(index, null, 2));
  writeFileSync(contentsFile, JSON.stringify(contents, null, 2));

  // icons.ts
  const iconsFile = join(buildDir, "icons.ts");

  // First pass: find icons in the same folder
  const icons = markdownFiles.reduce(
    /** @param {Record<string, string | null>} acc */
    (acc, file) => {
      const iconPath = join(dirname(file), "site-icon.tsx");
      acc[file] = existsSync(iconPath) ? iconPath : null;
      return acc;
    },
    {}
  );

  // Second pass: find icons in the same folder as the source file
  Object.entries(icons).forEach(([file, iconPath]) => {
    if (iconPath) return;
    const sourceFile = sourceFiles[file]?.[0];
    if (!sourceFile) return;
    const sourceIconPath = join(dirname(sourceFile), "site-icon.tsx");
    if (!existsSync(sourceIconPath)) return;
    icons[file] = sourceIconPath;
  });

  // Third pass: find icons in the same folder as the original component page
  Object.entries(icons).forEach(([file, iconPath]) => {
    if (iconPath) return;
    const key = Object.keys(icons)
      .filter((key) => !!icons[key])
      .find((key) => {
        const pageName = getPageName(key);
        const currentPageName = getPageName(file);
        return currentPageName.startsWith(pageName);
      });
    if (!key) return;
    icons[file] = icons[key] || null;
  });

  const iconsContents = Object.entries(icons)
    .map(([file, iconPath]) => {
      const category = pages.find((page) => {
        const context = Array.isArray(page.sourceContext)
          ? page.sourceContext
          : [page.sourceContext];
        return context.some((context) => file.startsWith(context));
      });
      invariant(category);
      const pageName = getPageName(file);
      return iconPath
        ? `export { default as ${camelCase(
            `${category.slug}/${pageName}`
          )} } from "${pathToImport(iconPath)}";\n`
        : "";
    })
    .join("");

  writeFileSync(iconsFile, iconsContents);

  performance.mark("writeFiles:end");
  const { duration } = performance.measure(
    "writeFiles",
    "writeFiles:start",
    "writeFiles:end"
  );
  console.log(
    `${chalk.green("pages")} - wrote pages in ${Math.round(duration)}ms`
  );
}

class PagesWebpackPlugin {
  /**
   * @param {object} options
   * @param {string} options.buildDir The directory where the build files should
   * be placed.
   * @param {import("./types.js").Page[]} options.pages
   */
  constructor(options) {
    this.buildDir = getBuildDir(options.buildDir);
    this.pages = options.pages;
    // rimrafSync(this.buildDir);
    fse.ensureDirSync(this.buildDir);
    writeFiles(this.buildDir, this.pages);
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    const pages = this.pages;
    const contexts = pages.flatMap((page) => page.sourceContext);

    const externalContexts = contexts.filter(
      (context) => !context.startsWith(process.cwd())
    );

    compiler.options.module.rules.push({
      issuer: (value) =>
        externalContexts.some((exclude) => value.startsWith(exclude)),
      include: externalContexts,
      test: /style\.css$/,
      loader: "null-loader",
    });

    compiler.hooks.make.tap("PagesWebpackPlugin", (compilation) => {
      if (!compiler.watchMode) return;
      for (const context of contexts) {
        compilation.contextDependencies.add(context);
        getPageEntryFiles(context).forEach((file) => {
          compilation.fileDependencies.add(file);
          compilation.contextDependencies.add(dirname(file));
        });
      }
    });

    compiler.hooks.watchRun.tap("PagesWebpackPlugin", (compiler) => {
      const { modifiedFiles, removedFiles } = compiler;
      if (!modifiedFiles) return;
      if (!removedFiles) return;

      /** @param {string} file */
      const log = (file, removed = false) => {
        console.log(
          `${
            removed ? chalk.red("removed page") : chalk.yellow("updated page")
          } - ${file}`
        );
      };

      for (const file of removedFiles) {
        if (!contexts.some((context) => file.includes(context))) continue;
        log(file, true);
        return writeFiles(this.buildDir, pages);
      }

      if (modifiedFiles.size === 1) {
        const context = contexts.find((context) => modifiedFiles.has(context));
        if (context) {
          log(context);
          return writeFiles(this.buildDir, pages);
        }
      }

      for (const file of modifiedFiles) {
        if (contexts.some((context) => file === context)) continue;
        if (!contexts.some((context) => file.includes(context))) continue;
        log(file);
        return writeFiles(this.buildDir, pages);
      }
    });
  }
}

export default PagesWebpackPlugin;
