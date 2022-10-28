// @ts-check
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const matter = require("gray-matter");
const { uniq, upperFirst, camelCase } = require("lodash");
const { marked } = require("marked");
const prettier = require("prettier");
const { Project, Node, Structure } = require("ts-morph");
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
  const name = /(index\.[jt]sx?|readme\.mdx?)$/i.test(filename)
    ? `${path.basename(path.dirname(filename))}`
    : `${path.basename(filename, path.extname(filename))}`;
  // Remove leading digits.
  return name.replace(/^\d+\-/, "");
}

/**
 * @param {string} filename
 */
function getModuleName(filename) {
  return upperFirst(camelCase(getPageName(filename)));
}

/**
 * @param {string} filename
 */
function getPageFilename(filename, extension = ".js") {
  return `${getPageName(filename)}${extension}`;
}

/**
 * @param {import('hast').Element | import('hast').ElementContent} node
 * @returns {node is import("hast").Element}
 */
function isPlaygroundNode(node) {
  if (!("tagName" in node)) return false;
  if (node.tagName !== "a") return false;
  if (!node.properties) return false;
  return "dataPlayground" in node.properties;
}

/**
 * @param {import('hast').Element} node
 */
function isPlaygroundParagraphNode(node) {
  if (node.tagName !== "p") return false;
  const [child] = node.children;
  if (!child) return false;
  return isPlaygroundNode(child);
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
  const relativeDependencyLoader = pathToPosix(
    path.relative(dest, dependencyLoader)
  );
  importerFilePath = importerFilePath && pathToPosix(importerFilePath);
  const originalDependencyLoader = importerFilePath
    ? `${relativeDependencyLoader}?importerFilePath=${importerFilePath}!`
    : "";
  const originalRelativeSource = pathToPosix(path.relative(dest, filename));
  const originalImport = {
    originalSource,
    defaultExport: true,
    filename: originalRelativeSource,
    source: `!raw-loader!${originalDependencyLoader}${originalRelativeSource}`,
    identifier: pathToIdentifier(originalRelativeSource),
  };

  if (/\.md$/.test(filename)) {
    const relativeMarkdownLoader = pathToPosix(
      path.relative(dest, markdownLoader)
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
        path.relative(dest, mod.resolvedFileName)
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
  const { visit } = await import("unist-util-visit");
  const { toString } = await import("hast-util-to-string");

  const { data, content: contentWithoutMatter } = matter(content);

  const tree = unified()
    .use(rehypeParse, { fragment: true })
    .parse(marked(contentWithoutMatter));

  tree.data = { ...data, ...tree.data, tableOfContents: [] };

  visit(tree, "element", (node) => {
    /** @type any */
    const tableOfContents = tree.data?.tableOfContents;
    if (node.tagName === "h2") {
      const id = node.properties?.id;
      const text = toString(node);
      tableOfContents.push({ id, text });
    }
    if (node.tagName === "h3") {
      const lastH2 = tableOfContents[tableOfContents.length - 1];
      if (!lastH2) return;
      const id = node.properties?.id;
      const text = toString(node);
      lastH2.children = lastH2.children || [];
      lastH2.children.push({ id, text });
    }
  });

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
    if (!isPlaygroundNode(node)) return;
    const href = node.properties?.href;
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

  const componentSource = pathToPosix(path.relative(dest, componentPath));

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
 * @param {string} filename
 * @param {import("./types").Page["getGroup"]} [getGroup]
 * @param {import("hast").Root} [tree]
 * @returns {Promise<import("./types").PageIndexDetail>}
 */
async function getPageMeta(filename, getGroup, tree) {
  tree = tree || (await getPageTreeFromFile(filename));
  const slug = getPageName(filename);
  let title = "";
  let content = "";
  const { visit } = await import("unist-util-visit");
  const { toString } = await import("hast-util-to-string");
  visit(tree, "element", (node) => {
    if (node.tagName === "h1" && !title) {
      title = toString(node).trim();
    }
    if (node.tagName === "p" && !content) {
      content = toString(node).trim();
    }
  });
  const group = getGroup?.(filename) || null;
  return { group, slug, title, content };
}

/**
 * @param {string} filename
 * @param {string} category
 * @param {import("./types").Page["getGroup"]} [getGroup]
 */
async function getPageSections(filename, category, getGroup) {
  const tree = await getPageTreeFromFile(filename);
  const meta = await getPageMeta(filename, getGroup, tree);
  const { visit } = await import("unist-util-visit");
  const { toString } = await import("hast-util-to-string");
  /** @type {string | null} */
  let parentSection = null;
  /** @type {string | null} */
  let section = null;
  /** @type {string | null} */
  let id = null;
  const pageMeta = {
    ...meta,
    category,
    /** @type {Array<import("./types").PageContent>} */
    sections: [],
  };
  visit(tree, "element", (node) => {
    if (node.tagName === "h2") {
      parentSection = null;
      section = toString(node).trim();
      id = `${node.properties?.id}`;
    }
    if (node.tagName === "h3") {
      parentSection = parentSection || section;
      section = toString(node).trim();
      id = `${node.properties?.id}`;
    }
    if (node.tagName === "p") {
      if (isPlaygroundParagraphNode(node)) return;
      const content = toString(node).trim();
      const existingSection = pageMeta.sections.find((s) => s.id === id);
      if (existingSection) {
        existingSection.content += `\n\n${content}`;
      } else {
        pageMeta.sections.push({
          ...meta,
          category,
          parentSection,
          section,
          id,
          content,
        });
      }
    }
  });
  return pageMeta;
}

/**
 * @param {string} buildDir
 */
function getPageIndexPath(buildDir) {
  return path.join(buildDir, "index.json");
}

/**
 * @param {string} buildDir
 */
function getPageContentsPath(buildDir) {
  return path.join(buildDir, "contents.json");
}

/**
 * @param {object} options
 * @param {string} options.filename
 * @param {string} options.name
 * @param {string} options.buildDir
 * @param {import("./types").Page["getGroup"]} [options.getGroup]
 */
async function writePageMeta({ filename, name, buildDir, getGroup }) {
  const indexPath = getPageIndexPath(buildDir);
  const contentsPath = getPageContentsPath(buildDir);

  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, "{}");
  }
  if (!fs.existsSync(contentsPath)) {
    fs.writeFileSync(contentsPath, "[]");
  }

  const { sections, category, ...meta } = await getPageSections(
    filename,
    name,
    getGroup
  );

  /** @type {import("./types").PageIndex} */
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  /** @type {import("./types").PageContents} */
  const contents = JSON.parse(fs.readFileSync(contentsPath, "utf8"));

  index[name] = index[name] || [];
  const categoryIndex = index[name] || [];
  const i = categoryIndex.findIndex((page) => page.slug === meta.slug);

  if (i !== -1) {
    categoryIndex[i] = meta;
  } else {
    categoryIndex.push(meta);
  }

  const nextContents = contents.filter((page) => page.slug !== meta.slug);
  nextContents.push(...sections);

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  fs.writeFileSync(contentsPath, JSON.stringify(nextContents, null, 2));
}

const project = new Project({
  tsConfigFilePath: path.join(__dirname, "../../tsconfig.json"),
});

/**
 * @param {import("ts-morph").Symbol} symbol
 */
function getDeclaration(symbol) {
  const declarations = symbol.getDeclarations();
  return declarations[0];
}

/**
 * @param {import("ts-morph").Node} node
 */
function getJsDoc(node) {
  if (!Node.isJSDocable(node)) return null;
  const jsDocs = node.getJsDocs();
  return jsDocs[jsDocs.length - 1];
}

/**
 * @param {import("ts-morph").Node} node
 */
function getDescription(node) {
  const jsDoc = getJsDoc(node);
  if (!jsDoc) return "";
  return jsDoc
    .getDescription()
    .trim()
    .replace(/\n([^\n])/g, " $1");
}

/**
 * @param {object} options
 * @param {string} options.filename
 * @param {string} options.name
 * @param {string} options.buildDir
 * @param {import("./types").Page["getGroup"]} [options.getGroup]
 */
async function writeAPIPage({ filename, name, buildDir, getGroup }) {
  const dest = path.join(buildDir, name);
  const sourceFile = project.getSourceFile(filename);
  if (!sourceFile) return;
  const moduleName = getModuleName(filename);
  const declarations = sourceFile.getExportedDeclarations();
  const isState = moduleName.endsWith("State");
  if (isState) {
  } else {
    const module = declarations.get(moduleName)?.[0];
    if (!module) return;
    const symbol =
      Node.isVariableDeclaration(module) && module.getVariableStatement();
    if (!symbol) return;
    const docs = getJsDoc(symbol);
    const tags = docs?.getTags();
    if (tags) {
      console.log(tags.length);
      tags.forEach((tag) => {
        console.log("dsadsa", tag.getTagName(), tag.getCommentText());
      });
    }
    const moduleMeta = {
      name: moduleName,
      description: getDescription(symbol),
    };
    console.log(moduleMeta);
    const props = declarations.get(`${moduleName}Options`)?.[0];
    if (!props) return;
    const obj = props
      .getType()
      .getProperties()
      .map((prop) => {
        const decl = prop.getDeclarations()?.[0];
        if (!decl) return;
        return {
          name: prop.getEscapedName(),
          type: decl?.getType().getText(decl),
          description: getDescription(decl),
        };
      });
    // console.log(obj);
  }
}

/**
 * @param {object} options
 * @param {string} options.filename
 * @param {string} options.name
 * @param {string} options.buildDir
 * @param {string} options.componentPath
 * @param {import("./types").Page["getGroup"]} [options.getGroup]
 */
async function writePage({
  filename,
  name,
  buildDir,
  componentPath,
  getGroup,
}) {
  const dest = path.join(buildDir, name);
  // If there's already a readme.md file in the same directory, we'll generate
  // the page from that, so we can just return the source here for the
  // index.js file.
  if (getReadmePathFromIndex(filename)) return;

  const pagePath = path.join(dest, getPageFilename(filename));
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });

  const content = await getPageContent({ filename, dest, componentPath });
  fs.writeFileSync(pagePath, content);

  const ext = path.extname(filename);

  if (ext !== ".md") return;

  await writePageMeta({ filename, name, buildDir, getGroup });
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
  getPageIndexPath,
  getPageContentsPath,
  writeAPIPage,
  writePage,
  getFiles,
  getPagesDir,
  getBuildDir,
  getEntryPath,
  resetBuildDir,
  writeEntryFile,
  writeSymlinks,
};
