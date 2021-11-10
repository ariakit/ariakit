const fs = require("fs");
const path = require("path");
const { EntryPlugin } = require("webpack");
const { getPageFilename } = require("./utils");

class PagesWebpackPlugin {
  /**
   * @param {object} options
   * @param {string} options.name
   * @param {string} options.sourceContext
   * @param {string} options.sourceRegExp
   * @param {string} options.buildDir
   * @param {string} options.pagesDir
   */
  constructor(options) {
    this.name = options.name;
    this.sourceContext = options.sourceContext;
    this.sourceRegExp = options.sourceRegExp;
    this.buildDir = options.buildDir || path.resolve(process.cwd(), ".pages");
    this.pagesDir = options.pagesDir || path.resolve(process.cwd(), "pages");

    fs.rmSync(this.buildDir, { recursive: true, force: true });
    fs.mkdirSync(this.buildDir, { recursive: true });
    this.entryFile = path.resolve(this.buildDir, `${this.name}-context.js`);

    const stringTest = this.sourceRegExp.toString();
    fs.writeFileSync(
      this.entryFile,
      `// ${Date.now()}
const req = require.context("${this.sourceContext}", true, ${stringTest});
req.keys().forEach(req);
`
    );
    if (fs.lstatSync(path.join(this.pagesDir, this.name)).isSymbolicLink()) {
      fs.unlinkSync(path.join(this.pagesDir, this.name));
    }
    fs.symlinkSync(
      path.relative(
        path.join(this.pagesDir),
        path.join(this.buildDir, this.name)
      ),
      path.join(this.pagesDir, this.name)
    );
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    compiler.options.module.rules.push({
      test: this.sourceRegExp,
      loader: path.resolve(__dirname, "page-loader.js"),
      options: {
        name: this.name,
        buildDir: this.buildDir,
      },
    });

    compiler.hooks.watchRun.tap("PagesWebpackPlugin", () => {
      if (!compiler.removedFiles) return;
      for (const file of compiler.removedFiles) {
        if (file.includes(this.sourceContext) && this.sourceRegExp.test(file)) {
          const pageDir = path.resolve(
            this.buildDir,
            this.name,
            getPageFilename(file)
          );
          if (fs.existsSync(pageDir)) {
            fs.rmSync(pageDir);
          }
        }
      }
    });

    const entryOptions = { name: this.name };
    const entry = EntryPlugin.createDependency(this.entryFile, entryOptions);

    compiler.hooks.make.tapAsync(
      "PagesWebpackPlugin",
      (compilation, callback) => {
        compilation.addEntry(__dirname, entry, this.name, callback);
      }
    );
  }
}

module.exports = PagesWebpackPlugin;
