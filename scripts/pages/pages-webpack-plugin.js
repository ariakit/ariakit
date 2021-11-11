const fs = require("fs");
const path = require("path");
const { EntryPlugin } = require("webpack");
const pageLoader = require("./page-loader");
const { getPageFilename } = require("./utils");

/**
 *
 * @param {string} dir
 * @param {RegExp} pattern
 * @param {string[]} files
 */
function getFiles(dir, pattern, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    if (/node_modules/.test(itemPath)) continue;
    if (item.isDirectory()) {
      getFiles(itemPath, pattern, files);
    } else if (pattern.test(itemPath)) {
      files.push(itemPath);
    }
  }
  return files;
}

class PagesWebpackPlugin {
  /**
   * @param {object} options
   * @param {string} options.name The name of the pages secion.
   * @param {string} options.sourceContext The directory where the sources are
   * located.
   * @param {string} options.sourceRegExp The regular expression to match the
   * source files.
   * @param {string} options.componentPath The path of the component that will
   * be used to render the page.
   * @param {string} [options.buildDir] The directory where the build files
   * should be placed.
   * @param {string} [options.pagesDir] The directory where the symlinks for the
   * build files should be placed.
   */
  constructor(options) {
    this.name = options.name;
    this.sourceContext = options.sourceContext;
    this.sourceRegExp = options.sourceRegExp;
    this.componentPath = options.componentPath;
    this.buildDir = options.buildDir || path.join(process.cwd(), ".pages");
    this.pagesDir = options.pagesDir || path.join(process.cwd(), "pages");
    this.entryPath = path.join(this.buildDir, `${this.name}-entry.js`);

    this.resetBuildDir();

    // TODO: Find a better way to do this.
    const files = getFiles(this.sourceContext, this.sourceRegExp);
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      const loaderContext = {
        resourcePath: file,
        getOptions: () => ({
          name: this.name,
          buildDir: this.buildDir,
          componentPath: this.componentPath,
        }),
      };
      pageLoader.call(loaderContext, source);
    }

    this.writeEntryFile();
    this.writeSymlinks();
  }

  resetBuildDir() {
    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir, { recursive: true });
      return;
    }

    const buildPath = path.join(this.buildDir, this.name);

    if (fs.existsSync(buildPath)) {
      fs.rmSync(buildPath, { recursive: true, force: true });
    }
    if (fs.existsSync(this.entryPath)) {
      fs.rmSync(this.entryPath);
    }

    if (!fs.readdirSync(this.buildDir).length) {
      fs.rmSync(this.buildDir);
      fs.mkdirSync(this.buildDir, { recursive: true });
    }
  }

  writeEntryFile() {
    const stringTest = this.sourceRegExp.toString();
    // const timestamp = Date.now();
    fs.writeFileSync(
      this.entryPath,
      // `// ${timestamp}
      `const req = require.context("${this.sourceContext}", true, ${stringTest});
req.keys().forEach(req);
`
    );
  }

  writeSymlinks() {
    const symlinkPath = path.join(this.pagesDir, this.name);
    const buildPath = path.join(this.buildDir, this.name);
    const relativeBuildPath = path.relative(this.pagesDir, buildPath);
    try {
      if (fs.lstatSync(symlinkPath).isSymbolicLink()) {
        fs.unlinkSync(symlinkPath);
      }
    } catch (e) {
      // Do nothing
    }
    fs.symlinkSync(relativeBuildPath, symlinkPath);
  }

  /**
   * @param {string} file
   */
  testFile(file) {
    return file.includes(this.sourceContext) && this.sourceRegExp.test(file);
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    compiler.options.module.rules.push({
      test: (file) => this.testFile(file),
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
        if (this.testFile(file)) {
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
      compilation.addEntry(this.buildDir, entry, this.name, cb);
    });
  }
}

module.exports = PagesWebpackPlugin;
