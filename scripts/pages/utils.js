// @ts-check
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { uniq } = require("lodash");
const { marked } = require("marked");
const prettier = require("prettier");
const ts = require("typescript");
const babelConfig = require("../../babel.config");
const { compilerOptions } = require("../../tsconfig.json");

const t = babel.types;
const compilerHost = ts.createCompilerHost(compilerOptions);

const dependencyLoader = path.join(__dirname, "dependency-loader.js");
const markdownLoader = path.join(__dirname, "markdown-loader.js");

/**
 * @param {string} source The soruce path of the import declaration.
 * @param {string} filename The filename of the file that contains the import
 * declaration.
 */
function resolveModuleName(source, filename) {
  const res = ts.resolveModuleName(
    source,
    filename,
    { ...compilerOptions, baseUrl: path.resolve(__dirname, "../..") },
    compilerHost
  );
  if (res.resolvedModule) {
    return res.resolvedModule;
  }
  const resolvedFileName = require.resolve(source, {
    paths: [path.dirname(filename)],
  });
  return {
    resolvedFileName,
    isExternalLibraryImport: /node_modules/.test(resolvedFileName),
  };
}

/**
 * @param {string} path Path that will be converted to an identifier string.
 */
function pathToIdentifier(path) {
  return path.replace(/[\.\/\\:\-@]/g, "_");
}

/**
 * @param {string} path
 */
function pathToPosix(path) {
  return path.replace(/\\/g, "/");
}

/**
 * @param {string} filename
 */
function getPageName(filename) {
  if (/(index\.[jt]sx?|readme\.mdx?)$/i.test(filename)) {
    return `${path.basename(path.dirname(filename))}`;
  }
  return `${path.basename(filename, path.extname(filename))}`;
}

/**
 * @param {string} filename
 */
function getPageFilename(filename, extension = ".js") {
  return `${getPageName(filename)}${extension}`;
}

/**
 * @param {object} options
 * @param {string} options.filename The filename of the file that contains the
 * imports.
 * @param {string} options.dest The destination path where the imports will be
 * written.
 * @param {string} [options.originalSource] The source path of the import.
 * @param {string} [options.importerFilePath] The path to the file that contains
 * the import.
 */
function getPageImports({ filename, dest, originalSource, importerFilePath }) {
  const pagePath = path.join(dest, getPageFilename(filename, ""));
  const relativeDependencyLoader = pathToPosix(
    path.relative(pagePath, dependencyLoader)
  );
  importerFilePath = importerFilePath && pathToPosix(importerFilePath);
  const originalDependencyLoader = importerFilePath
    ? `${relativeDependencyLoader}?importerFilePath=${importerFilePath}!`
    : "";
  const originalRelativeSource = pathToPosix(path.relative(pagePath, filename));
  const originalImport = {
    originalSource,
    defaultExport: true,
    filename: originalRelativeSource,
    source: `!raw-loader!${originalDependencyLoader}${originalRelativeSource}`,
    identifier: pathToIdentifier(originalRelativeSource),
  };

  if (/\.md$/.test(filename)) {
    const relativeMarkdownLoader = pathToPosix(
      path.relative(pagePath, markdownLoader)
    );
    originalImport.source = `!${relativeMarkdownLoader}!${originalRelativeSource}`;
  }

  const imports = [originalImport];

  if (!/\.[tj]sx?$/.test(filename)) return imports;

  const content = fs.readFileSync(filename, "utf8");
  const parsed = babel.parseSync(content, { filename, ...babelConfig });

  babel.traverse(parsed, {
    enter(nodePath) {
      const isImportDeclaration = nodePath.isImportDeclaration();
      const isExportDeclaration = nodePath.isExportDeclaration();
      const isCallExpression = nodePath.isCallExpression();
      const isValidExpression =
        isImportDeclaration || isExportDeclaration || isCallExpression;
      if (!isValidExpression) return;
      // @ts-expect-error
      if (isExportDeclaration && !nodePath.node.source) return;
      if (isCallExpression && !t.isImport(nodePath.node.callee)) return;

      /** @type {string} */
      const source = isCallExpression
        ? // @ts-expect-error
          nodePath.node.arguments[0].value
        : // @ts-expect-error
          nodePath.node.source.value;
      const mod = resolveModuleName(source, filename);
      const relativeFilename = pathToPosix(
        path.relative(pagePath, mod.resolvedFileName)
      );

      if (mod.isExternalLibraryImport) {
        imports.push({
          source,
          originalSource: source,
          filename: relativeFilename,
          identifier: pathToIdentifier(relativeFilename),
          defaultExport: false,
        });
        return;
      }

      if (/\.s?css$/.test(relativeFilename)) {
        imports.push({
          source: `!raw-loader!postcss-loader!${relativeFilename}`,
          originalSource: source,
          filename: relativeFilename,
          identifier: pathToIdentifier(relativeFilename),
          defaultExport: true,
        });
        return;
      }

      const isInternal = source.startsWith(".");

      if (isInternal) {
        const nextImports = getPageImports({
          filename: mod.resolvedFileName,
          dest,
          originalSource: source,
          importerFilePath: filename,
        });
        imports.push(...nextImports);
        return;
      }

      imports.push({
        source: relativeFilename,
        originalSource: source,
        filename: relativeFilename,
        identifier: pathToIdentifier(relativeFilename),
        defaultExport: false,
      });
    },
  });

  return imports;
}

/**
 * @param {string} filename
 */
function createPageContent(filename) {
  const title = getPageName(filename);
  const importPath = pathToPosix(path.basename(filename));
  const content = `# ${title}
<a href="./${importPath}" data-playground>Example</a>`;
  return content;
}

/**
 * @param {string} content The markdown content.
 */
async function getPageTreeFromContent(content) {
  const { unified } = await import("unified");
  const { default: rehypeParse } = await import("rehype-parse");
  const tree = unified()
    .use(rehypeParse, { fragment: true })
    .parse(marked(content));
  return tree;
}

/**
 * @param {string} filename The filename of the file that contains the markdown.
 */
function getPageTreeFromFile(filename) {
  const isMarkdown = /\.md$/.test(filename);
  const content = isMarkdown
    ? fs.readFileSync(filename, "utf8")
    : createPageContent(filename);
  return getPageTreeFromContent(content);
}

/**
 * @param {object} options
 * @param {string} options.filename The filename that will be used as a source
 * to write the page.
 * @param {string} options.dest The directory where the page will be written.
 * @param {string} options.componentPath The path to the component that will be
 * used to render the page.
 */
async function getPageContent({ filename, dest, componentPath }) {
  const isMarkdown = /\.md$/.test(filename);

  /** @type {Record<string, ReturnType<typeof getPageImports>>} */
  const imports = isMarkdown
    ? { default: getPageImports({ filename, dest }) }
    : {};

  const { visit } = await import("unist-util-visit");
  const tree = await getPageTreeFromFile(filename);

  visit(tree, "element", (node) => {
    if (node.tagName !== "a") return;
    if (!node.properties || !("dataPlayground" in node.properties)) return;
    const href = node.properties.href;
    if (typeof href !== "string") return;
    const nextFilename = path.resolve(path.dirname(filename), href);
    imports[href] = getPageImports({
      filename: nextFilename,
      dest,
      importerFilePath: isMarkdown ? filename : undefined,
    });
  });

  const importsFlat = Object.values(imports).flat();

  const importDeclarations = uniq(
    importsFlat.map((item, i, array) => {
      const isDuplicate = array
        .slice(0, i)
        .some(({ identifier }) => identifier === item.identifier);
      if (!item.identifier || isDuplicate) {
        return `import "${item.source}";`;
      } else if (item.defaultExport) {
        return `import ${item.identifier} from "${item.source}";`;
      }
      return `import * as ${item.identifier} from "${item.source}";`;
    })
  );

  const { default: _, ...markdownImports } = imports;

  const defaultValues = Object.entries(markdownImports).map(([key, value]) => {
    return `"${key}": {
      ${value
        .filter((i) => i.defaultExport)
        .map((i, _, array) => {
          const getName = (item = i) =>
            getPageFilename(item.filename, path.extname(item.filename));
          const name = getName();
          // If the filename already exists, we use the original filename.
          if (array.some((item) => item !== i && getName(item) === name)) {
            return `"${path.basename(i.filename)}": ${i.identifier},`;
          }
          return `"${name}": ${i.identifier},`;
        })
        .join("\n")}
    },`;
  });

  const deps = Object.entries(markdownImports).map(([key, value]) => {
    return `"${key}": {
      ${value
        .filter((i) => !i.defaultExport)
        .map((i) => `"${i.originalSource}": ${i.identifier},`)
        .join("\n")}
    },`;
  });
  const pagePath = path.join(dest, getPageFilename(filename, ""));

  const componentSource = pathToPosix(path.relative(pagePath, componentPath));

  const markdown =
    imports.default && imports.default[0]
      ? imports.default[0].identifier
      : JSON.stringify(tree);

  const isServer = deps.some((item) => item.includes("react-router"));

  const getServerSideProps = isServer
    ? `\nexport async function getServerSideProps() { return { props: {} } }`
    : "";

  const content = `
    /* Automatically generated */
    /* eslint-disable */
    ${importDeclarations.join("\n")}
    import Component from "${componentSource}";

    const props = {
      markdown: ${markdown},
      defaultValues: {
        ${defaultValues.join("\n")}
      },
      deps: {
        ${deps.join("\n")}
      },
    };

    export default function Page() {
      return <Component {...props} />;
    }
    ${getServerSideProps}
  `;

  return prettier.format(content, { parser: "babel" });
}

/**
 * @param {string} filename
 * @param {(path: string) => boolean} exists
 */
function getReadmePathFromIndex(filename, exists = fs.existsSync) {
  if (/readme\.md$/.test(filename)) return;
  const readmePath = path.join(path.dirname(filename), "readme.md");
  if (!exists(readmePath)) return;
  return readmePath;
}

/**
 * @param {object} options
 * @param {string} options.filename The filename that will be used as a source to write
 * the page.
 * @param {string} options.dest The directory where the page will be written.
 * @param {string} options.componentPath The path to the component that will be used to
 * render the page.
 */
async function writePage({ filename, dest, componentPath }) {
  // If there's already a readme.md file in the same directory, we'll generate
  // the page from that, so we can just return the source here for the index.js
  // file.
  if (getReadmePathFromIndex(filename)) return;
  const pagePath = path.join(dest, getPageFilename(filename, ""), "index.js");
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(
    pagePath,
    await getPageContent({ filename, dest, componentPath })
  );
}

/**
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
    } else if (pattern.test(pathToPosix(itemPath))) {
      files.push(itemPath);
    }
  }
  return files;
}

/**
 * @param {string} [pagesDir]
 */
function getPagesDir(pagesDir) {
  return pagesDir || path.join(process.cwd(), "pages");
}

/**
 * @param {string} [buildDir]
 */
function getBuildDir(buildDir) {
  return buildDir || path.join(process.cwd(), ".pages");
}

/**
 * @param {string} pageName
 * @param {string} buildDir
 */
function getEntryPath(pageName, buildDir) {
  return path.join(buildDir, `${pageName}-entry.js`);
}

/**
 * @param {string} pageName
 * @param {string} buildDir
 * @param {string} entryPath
 */
function resetBuildDir(pageName, buildDir, entryPath) {
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    return;
  }

  const buildPath = path.join(buildDir, pageName);

  if (fs.existsSync(buildPath)) {
    fs.rmSync(buildPath, { recursive: true, force: true });
  }
  if (fs.existsSync(entryPath)) {
    fs.rmSync(entryPath);
  }

  if (!fs.readdirSync(buildDir).length) {
    fs.rmdirSync(buildDir);
    fs.mkdirSync(buildDir, { recursive: true });
  }
}

/**
 * @param {string} sourceContext
 * @param {RegExp} sourceRegExp
 * @param {string} entryPath
 */
function writeEntryFile(sourceContext, sourceRegExp, entryPath) {
  const stringTest = sourceRegExp.toString();
  sourceContext = pathToPosix(sourceContext);
  fs.writeFileSync(
    entryPath,
    `const req = require.context("${sourceContext}", true, ${stringTest});
req.keys().forEach(req);
`
  );
}

/**
 * @param {string} pageName
 * @param {string} buildDir
 * @param {string} pagesDir
 */
function writeSymlinks(pageName, buildDir, pagesDir) {
  const symlinkPath = path.join(pagesDir, pageName);
  const buildPath = path.join(buildDir, pageName);
  const relativeBuildPath = path.relative(pagesDir, buildPath);
  try {
    const stat = fs.lstatSync(symlinkPath);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(symlinkPath);
    } else if (stat.isFile()) {
      fs.rmSync(symlinkPath);
    }
  } catch (e) {
    // Do nothing
  }
  fs.symlinkSync(relativeBuildPath, symlinkPath);
}

module.exports = {
  pathToPosix,
  getPageName,
  getPageFilename,
  getPageTreeFromContent,
  getPageTreeFromFile,
  getPageImports,
  getPageContent,
  getReadmePathFromIndex,
  writePage,
  getFiles,
  getPagesDir,
  getBuildDir,
  getEntryPath,
  resetBuildDir,
  writeEntryFile,
  writeSymlinks,
};
