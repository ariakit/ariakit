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
const cssLoader = path.join(__dirname, "css-loader.js");

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
  return path.replace(/[\.\/\-@]/g, "_");
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
 * @param {string} [options.cssTokensPath] The path to the css file that
 * contains the tokens.
 * @param {string} [options.importerFilePath] The path to the file that contains
 * the import.
 */
function getPageImports({
  filename,
  dest,
  cssTokensPath,
  originalSource,
  importerFilePath,
}) {
  const relativeDependencyLoader = path.relative(dest, dependencyLoader);
  const originalDependencyLoader = importerFilePath
    ? `${relativeDependencyLoader}?importerFilePath=${importerFilePath}!`
    : "";
  const originalRelativeSource = path.relative(dest, filename);
  const originalImport = {
    originalSource,
    defaultExport: true,
    filename: originalRelativeSource,
    source: `!raw-loader!${originalDependencyLoader}${originalRelativeSource}`,
    identifier: pathToIdentifier(originalRelativeSource),
  };

  if (/\.md$/.test(filename)) {
    const relativeMarkdownLoader = path.relative(dest, markdownLoader);
    originalImport.source = `!${relativeMarkdownLoader}!${originalRelativeSource}`;
  }

  const imports = [originalImport];

  if (!/\.[tj]sx?$/.test(filename)) return imports;

  const content = fs.readFileSync(filename, "utf8");
  const parsed = babel.parseSync(content, { filename, ...babelConfig });

  /** @type {babel.types.Program} */
  // @ts-ignore
  const program = parsed.program;

  program.body.forEach((node) => {
    if (!t.isImportDeclaration(node)) return;

    const source = node.source.value;
    const mod = resolveModuleName(source, filename);
    const relativeFilename = path.relative(dest, mod.resolvedFileName);

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
      const relativeCssLoader = path.relative(dest, cssLoader);
      imports.push({
        source: `!${relativeCssLoader}?cssTokensPath=${cssTokensPath}!${relativeFilename}`,
        originalSource: source,
        filename: relativeFilename,
        identifier: pathToIdentifier(relativeFilename),
        defaultExport: true,
      });
      return;
    }

    const isInternal = mod.resolvedFileName.startsWith(".");

    if (isInternal) {
      const nextImports = getPageImports({
        filename: mod.resolvedFileName,
        dest,
        cssTokensPath,
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
  });

  return imports;
}

/**
 * @param {string} filename
 */
function createPageContent(filename) {
  const title = getPageName(filename);
  const content = `# ${title}
<a href="./${path.basename(filename)}" data-playground>Example</a>`;
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
 * @param {string} [options.cssTokensPath] The path to the css file that
 * contains the tokens.
 */
async function getPageContent({
  filename,
  dest,
  componentPath,
  cssTokensPath,
}) {
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
      cssTokensPath,
      importerFilePath: isMarkdown ? filename : undefined,
    });
  });

  const importsFlat = Object.values(imports).flat();

  const importDeclarations = uniq(
    importsFlat.map((i) => {
      if (!i.identifier) return `import "${i.source}";`;
      if (i.defaultExport) return `import ${i.identifier} from "${i.source}";`;
      return `import * as ${i.identifier} from "${i.source}";`;
    })
  );

  const { default: _, ...markdownImports } = imports;

  const defaultValues = Object.entries(markdownImports).map(([key, value]) => {
    return `"${key}": {
      ${value
        .filter((i) => i.defaultExport)
        .map((i) => {
          const name = getPageFilename(i.filename, path.extname(i.filename));
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

  const componentSource = path.relative(dest, componentPath);

  const markdown =
    imports.default && imports.default[0]
      ? imports.default[0].identifier
      : JSON.stringify(tree);

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
 * @param {string} [options.cssTokensPath] The path to the css file that
 * contains the tokens.
 */
async function writePage({ filename, dest, componentPath, cssTokensPath }) {
  // If there's already a readme.md file in the same directory, we'll generate
  // the page from that, so we can just return the source here for the index.js
  // file.
  if (getReadmePathFromIndex(filename)) return;
  const pagePath = path.join(dest, getPageFilename(filename));
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(
    pagePath,
    await getPageContent({ filename, dest, componentPath, cssTokensPath })
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
    } else if (pattern.test(itemPath)) {
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
    if (fs.lstatSync(symlinkPath).isSymbolicLink()) {
      fs.unlinkSync(symlinkPath);
    }
  } catch (e) {
    // Do nothing
  }
  fs.symlinkSync(relativeBuildPath, symlinkPath);
}

module.exports = {
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
