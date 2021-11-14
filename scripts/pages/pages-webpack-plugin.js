// @ts-check
const fs = require("fs");
const path = require("path");
const { EntryPlugin } = require("webpack");
const { getPageFilename, getEntryPath, getBuildDir } = require("./utils");

class PagesWebpackPlugin {
  /**
   * @param {object} options
   * @param {string} options.name The name of the pages secion.
   * @param {string} options.sourceContext The directory where the sources are
   * located.
   * @param {RegExp} options.sourceRegExp The regular expression to match the
   * source files.
   * @param {string} options.componentPath The path of the component that will
   * be used to render the page.
   * @param {string} [options.buildDir] The directory where the build files
   * should be placed.
   */
  constructor(options) {
    this.name = options.name;
    this.sourceContext = options.sourceContext;
    this.sourceRegExp = options.sourceRegExp;
    this.componentPath = options.componentPath;
    this.buildDir = getBuildDir(options.buildDir);
    this.entryPath = getEntryPath(this.name, this.buildDir);
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    /** @param {string} file */
    const test = (file) =>
      file.includes(this.sourceContext) && this.sourceRegExp.test(file);

    compiler.options.module.rules.push({
      test,
      loader: path.join(__dirname, "page-loader.js"),
      options: {
        name: this.name,
        buildDir: this.buildDir,
        componentPath: this.componentPath,
      },
    });

    compiler.hooks.watchRun.tap("PagesWebpackPlugin", () => {
      if (!compiler.removedFiles) return;
      for (const file of compiler.removedFiles) {
        if (test(file)) {
          const pagePath = path.join(
            this.buildDir,
            this.name,
            getPageFilename(file)
          );
          if (fs.existsSync(pagePath)) {
            fs.rmSync(pagePath);
          }
        }
      }
    });

    const entryOptions = { name: this.name };
    const entry = EntryPlugin.createDependency(this.entryPath, entryOptions);

    compiler.hooks.make.tapAsync("PagesWebpackPlugin", (compilation, cb) => {
      compilation.addEntry(this.buildDir, entry, this.name, (error) =>
        cb(error)
      );
    });
  }
}

module.exports = PagesWebpackPlugin;
