const { readFileSync, writeFileSync, unlinkSync, mkdirSync } = require("fs");
const { dirname, relative, parse, resolve, basename, join } = require("path");
const babel = require("@babel/core");
const { uniq } = require("lodash");
const { marked } = require("marked");
const prettier = require("prettier");
const ts = require("typescript");
const babelConfig = require("../../babel.config");
const { compilerOptions } = require("../../tsconfig.json");

const t = babel.types;
const compilerHost = ts.createCompilerHost(compilerOptions);

/**
 * @param {string} source The soruce path of the import declaration.
 * @param {string} filename The filename of the file that contains the import
 * declaration.
 */
function resolveModuleName(source, filename) {
  const res = ts.resolveModuleName(
    source,
    filename,
    { ...compilerOptions, baseUrl: resolve(__dirname, "../..") },
    compilerHost
  );
  if (res.resolvedModule) {
    return res.resolvedModule;
  }
  const resolvedFileName = require.resolve(source, {
    paths: [dirname(filename)],
  });
  return {
    resolvedFileName,
    isExternalLibraryImport: /node_modules/.test(resolvedFileName),
  };
}

/**
 * @param {string} filename The filename of the file that contains the import
 * declaration.
 * @param {string} dest The destination path.
 */
function getRelativeSource(filename, dest) {
  const relativePath = relative(dest, filename);
  const parsedPath = parse(relativePath);
  if (parsedPath.name === "index") {
    return `./${parsedPath.dir}`;
  }
  return `./${parsedPath.dir}/${parsedPath.name}${
    /\.[tj]sx?$/.test(parsedPath.ext) ? "" : parsedPath.ext
  }`;
}

/**
 * @param {string} path Path that will be converted to an identifier string.
 */
function pathToIdentifier(path) {
  return path.replace(/[\.\/\-@]/g, "_");
}

/**
 * @param {string} filename The filename of the file that contains the imports.
 * @param {string} dest The destination path where the imports will be written.
 * @param {string} originalSource The source path of the import.
 */
function getPageImports(filename, dest, originalSource = ".") {
  const originalRelativeSource = getRelativeSource(filename, dest);
  const originalImport = {
    originalSource,
    defaultExport: true,
    filename: relative(dest, filename),
    source: `!raw-loader!${originalRelativeSource}`,
    identifier: pathToIdentifier(originalRelativeSource),
  };

  if (/\.md$/.test(filename)) {
    const loader = join(__dirname, "md-loader.js");
    const loaderPath = relative(dest, loader);
    originalImport.source = `!${loaderPath}!${originalRelativeSource}`;
  }

  const imports = [originalImport];

  if (!/\.[tj]sx?$/.test(filename)) return imports;

  const content = readFileSync(filename, "utf8");
  const parsed = babel.parse(content, { filename, ...babelConfig });

  /** @type {babel.types.Program} */
  const program = parsed.program;

  program.body.forEach((node) => {
    if (!t.isImportDeclaration(node)) return;

    const source = node.source.value;
    const mod = resolveModuleName(source, filename);
    const relativeFilename = relative(dest, mod.resolvedFileName);
    const relativeSource = getRelativeSource(mod.resolvedFileName, dest);

    if (mod.isExternalLibraryImport) {
      imports.push({
        source,
        originalSource: source,
        filename: relativeFilename,
        identifier: pathToIdentifier(source),
        defaultExport: false,
      });
      return;
    }

    if (/\.s?css$/.test(relativeFilename)) {
      imports.push({
        source: `!raw-loader!postcss-loader!${relativeFilename}`,
        originalSource: source,
        filename: relativeFilename,
        identifier: pathToIdentifier(source),
        defaultExport: true,
      });
      return;
    }

    const isInternal = mod.resolvedFileName.startsWith(dirname(filename));

    if (isInternal) {
      const nextImports = getPageImports(mod.resolvedFileName, dest, source);
      imports.push(...nextImports);
      return;
    }

    imports.push({
      source: relativeSource,
      originalSource: source,
      filename: relativeFilename,
      identifier: pathToIdentifier(relativeSource),
      defaultExport: false,
    });
  });

  return imports;
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
  const file = basename(filename);
  const content = isMarkdown
    ? readFileSync(filename, "utf8")
    : `# ${file}
<a href="./${file}" data-playground>Example</a>`;
  return getPageTreeFromContent(content);
}

/**
 * @param {string} filename The filename that will be used as a source to write
 * the page.
 * @param {string} dest The directory where the page will be written.
 * @param {string} componentPath The path to the component that will be used to
 * render the page.
 */
async function getPageContent(filename, dest, componentPath) {
  const isMarkdown = /\.md$/.test(filename);
  const imports = isMarkdown ? { default: getPageImports(filename, dest) } : {};

  const { visit } = await import("unist-util-visit");
  const tree = await getPageTreeFromFile(filename);

  visit(tree, "element", (node) => {
    if (node.tagName !== "a") return;
    if (!"dataPlayground" in node.properties) return;
    const href = node.properties.href;
    const nextFilename = resolve(dirname(filename), href);
    imports[href] = getPageImports(nextFilename, dest);
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

  const keys = uniq(
    Object.values(markdownImports)
      .flat()
      .filter((i) => i.defaultExport)
      .map((i) => i.identifier)
  );

  const defaultValues = Object.entries(markdownImports).map(([key, value]) => {
    return `"${key}": {
      ${value
        .filter((i) => i.defaultExport)
        .map((i) => `"${basename(i.filename)}": ${i.identifier},`)}
    },`;
  });

  const deps = Object.entries(markdownImports).map(([key, value]) => {
    return `"${key}": {
      ${value
        .filter((i) => !i.defaultExport)
        .map((i) => `"${i.originalSource}": ${i.identifier || {}},`)}
    },`;
  });

  const componentSource = relative(dest, componentPath);

  const content = `
    /* Automatically generated */
    /* eslint-disable */
    ${importDeclarations.join("\n")}
    import Component from "${componentSource}";

    const props = {
      key: ${keys.join("+") || "null"},
      markdown: ${
        isMarkdown ? imports.default[0].identifier : JSON.stringify(tree)
      },
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
 */
function getPageFilename(filename) {
  if (/(index\.[jt]sx?|readme\.mdx?)$/i.test(filename)) {
    return `${basename(dirname(filename))}.js`;
  }
  return `${basename(filename)}.js`;
}

/**
 * @param {string} filename The filename that will be used as a source to write
 * the page.
 * @param {string} dest The directory where the page will be written.
 * @param {string} componentPath The path to the component that will be used to
 * render the page.
 */
async function writePage(filename, dest, componentPath) {
  const pagePath = join(dest, getPageFilename(filename));
  mkdirSync(dirname(pagePath), { recursive: true });
  writeFileSync(pagePath, await getPageContent(filename, dest, componentPath));
}

module.exports = {
  getPageTreeFromContent,
  getPageTreeFromFile,
  getPageImports,
  getPageContent,
  getPageFilename,
  writePage,
};
