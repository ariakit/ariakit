const path = require("path");
const { EntryPlugin } = require("webpack");
const VirtualModulesPlugin = require("webpack-virtual-modules");

class PagesWebpackPlugin {
  /**
   * @param {object} options
   * @param {string} options.name
   * @param {string} options.context
   * @param {string} options.test
   */
  constructor(options) {
    this.name = options.name;
    this.context = options.context;
    this.test = options.test;

    this.entryPath = path.resolve(__dirname, "pages-entry.ts");

    const stringTest = options.test.toString();

    this.virtualModules = new VirtualModulesPlugin({
      [this.entryPath]: `
        const req = require.context("${options.context}", true, ${stringTest});
        req.keys().forEach(req);`,
    });
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    this.virtualModules.apply(compiler);

    compiler.options.module.rules.push({
      test: this.test,
      use: path.resolve(__dirname, `page-loader.js?name=${this.name}`),
    });

    const entry = EntryPlugin.createDependency(this.entryPath, {
      name: this.name,
    });

    compiler.hooks.make.tapAsync(
      "PagesWebpackPlugin",
      (compilation, callback) => {
        compilation.addEntry(__dirname, entry, this.name, callback);
      }
    );
  }
}

module.exports = PagesWebpackPlugin;
