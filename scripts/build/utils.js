const { join, dirname, relative, basename } = require("path");
const ast = require("@textlint/markdown-to-ast");
const inject = require("md-node-inject");
const toMarkdown = require("ast-to-markdown");
const {
  readdirSync,
  ensureDirSync,
  writeFileSync,
  readFileSync,
  lstatSync,
  existsSync
} = require("fs-extra");
const { Project, ts } = require("ts-morph");
const rimraf = require("rimraf");
const chalk = require("chalk");
const log = require("../log");

/**
 * Converts ./path/to/file.js to ./path/to
 * @param {string} dir
 */
function resolveDir(dir) {
  if (!/\.(t|j)s$/.test(dir)) {
    return dir;
  }
  return dirname(dir);
}

/**
 * @param {string} rootPath
 */
function getPackage(rootPath) {
  // eslint-disable-next-line import/no-dynamic-require
  return require(join(rootPath, "package.json"));
}

/**
 * @param {string} rootPath
 */
function getModuleDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.module);
  } catch (e) {
    // resolveDir will throw an error if pkg.module doesn't exist
    // we just return false here.
    return false;
  }
}

/**
 * @param {string} rootPath
 */
function getUnpkgDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.unpkg);
  } catch (e) {
    return false;
  }
}

/**
 * @param {string} rootPath
 */
function getTypesDir(rootPath) {
  const pkg = getPackage(rootPath);
  try {
    return resolveDir(pkg.types || pkg.typings);
  } catch (e) {
    return false;
  }
}

/**
 * @param {string} rootPath
 */
function getMainDir(rootPath) {
  const { main } = getPackage(rootPath);
  return resolveDir(main);
}

/**
 * @param {string} path
 */
function removeExt(path) {
  return path.replace(/\.[^.]+$/, "");
}

/**
 * @param {string} path
 * @param {number} index
 * @param {string[]} array
 */
function isRootModule(path, index, array) {
  const rootPath = path.replace(/^([^/]+).*$/, "$1");
  return path === rootPath || !array.includes(rootPath);
}

/**
 * Filters out /dist, /es, /lib, /ts etc.
 * @param {string} rootPath
 * @param {string} filename
 */
function isSourceModule(rootPath, filename) {
  const dists = [
    getModuleDir(rootPath),
    getUnpkgDir(rootPath),
    getTypesDir(rootPath),
    getMainDir(rootPath)
  ];
  return !dists.includes(filename);
}

/**
 * @param {string} path
 */
function isDirectory(path) {
  return lstatSync(path).isDirectory();
}

/**
 * @param {string} rootPath
 */
function getSourcePath(rootPath) {
  return join(rootPath, "src");
}

/**
 * Filters out files starting with __
 * Includes directories and TS/JS files.
 * @param {string} rootPath
 * @param {string} filename
 */
function isPublicModule(rootPath, filename) {
  const isPrivate = /^__/.test(filename);
  if (isPrivate) {
    return false;
  }
  if (isDirectory(join(rootPath, filename))) {
    return true;
  }
  return /\.(j|t)sx?$/.test(filename);
}

/**
 * Returns { index: "path/to/index", moduleName: "path/to/moduleName" }
 * @param {string} rootPath
 * @param {string} prefix
 */
function getPublicFiles(rootPath, prefix = "") {
  return readdirSync(rootPath)
    .filter(filename => isPublicModule(rootPath, filename))
    .reduce((acc, filename) => {
      const path = join(rootPath, filename);
      const childFiles =
        isDirectory(path) && getPublicFiles(path, join(prefix, filename));
      return {
        ...(childFiles || { [removeExt(join(prefix, filename))]: path }),
        ...acc
      };
    }, {});
}

/**
 * Returns ["module", "path/to/module", ...]
 * @param {string} rootPath
 */
function getProxyFolders(rootPath) {
  const publicFiles = getPublicFiles(getSourcePath(rootPath));
  return Object.keys(publicFiles)
    .map(name => name.replace(/\/index$/, ""))
    .filter(name => name !== "index");
}

/**
 * Returns ["lib", "es", "dist", "ts", "moduleName", ...]
 * @param {string} rootPath
 */
function getBuildFolders(rootPath) {
  return [
    getMainDir(rootPath),
    getUnpkgDir(rootPath),
    getModuleDir(rootPath),
    getTypesDir(rootPath),
    ...getProxyFolders(rootPath)
  ].filter(Boolean);
}

/**
 * @param {string} rootPath
 */
function cleanBuild(rootPath) {
  const pkg = getPackage(rootPath);
  const cleaned = [];
  getBuildFolders(rootPath)
    .filter(isRootModule)
    .forEach(name => {
      rimraf.sync(name);
      cleaned.push(chalk.bold(chalk.gray(name)));
    });
  if (cleaned.length) {
    log(
      ["", `Cleaned in ${chalk.bold(pkg.name)}:`, `${cleaned.join(", ")}`].join(
        "\n"
      )
    );
  }
}

/**
 * @param {string} path
 */
function getIndexPath(path) {
  return join(
    path,
    readdirSync(path).find(file => /^index\.(j|t)sx?/.test(file))
  );
}

/**
 * @param {string} rootPath
 */
function makeGitignore(rootPath) {
  const pkg = getPackage(rootPath);
  const buildFolders = getBuildFolders(rootPath);
  const contents = buildFolders
    .filter(isRootModule)
    .map(name => `/${name}`)
    .join("\n");
  writeFileSync(
    join(rootPath, ".gitignore"),
    `# Automatically generated by ${relative(
      rootPath,
      __filename
    )}\n${contents}\n`
  );
  log(
    `\nCreated in ${chalk.bold(pkg.name)}: ${chalk.bold(
      chalk.green(".gitignore")
    )}`
  );
}

/**
 * @param {string} rootPath
 */
function makePlaygroundDeps(rootPath) {
  const { name } = getPackage(rootPath);
  const playPath = join(__dirname, "../../packages/reakit-playground");
  const playDepsPath = join(getSourcePath(playPath), "__deps");
  const buildFolders = getBuildFolders(rootPath);
  const objectContents = buildFolders
    .filter(filename => isSourceModule(rootPath, filename))
    .reduce(
      (acc, folder) =>
        `${acc},\n  "${join(name, folder)}": require("${join(name, folder)}")`,
      `  "${name}": require("${name}")`
    );
  const contents = `/* eslint-disable */
// Automatically generated by ${relative(playDepsPath, __filename)}
export default {
${objectContents}
};
`;
  ensureDirSync(playDepsPath);
  writeFileSync(join(playDepsPath, `${name}.ts`), contents);
  log(
    `\nCreated in ${chalk.bold("reakit-playground")}: ${chalk.bold(
      chalk.green(`__deps/${name}.ts`)
    )}`
  );
}

/**
 * @param {string} rootPath
 * @param {string} moduleName
 */
function getProxyPackageContents(rootPath, moduleName) {
  const { name } = getPackage(rootPath);
  const mainDir = getMainDir(rootPath);
  const moduleDir = getModuleDir(rootPath);
  const typesDir = getTypesDir(rootPath);
  const prefix = "../".repeat(moduleName.split("/").length);
  const json = {
    name: `${name}/${moduleName}`,
    private: true,
    sideEffects: false,
    main: join(prefix, mainDir, moduleName),
    ...(moduleDir ? { module: join(prefix, moduleDir, moduleName) } : {}),
    ...(typesDir ? { types: join(prefix, typesDir, moduleName) } : {})
  };
  return JSON.stringify(json, null, 2);
}

/**
 * @param {string} rootPath
 */
function makeProxies(rootPath) {
  const pkg = getPackage(rootPath);
  const created = [];
  getProxyFolders(rootPath).forEach(name => {
    ensureDirSync(name);
    writeFileSync(
      `${name}/package.json`,
      getProxyPackageContents(rootPath, name)
    );
    created.push(chalk.bold(chalk.green(name)));
  });
  if (created.length) {
    log(
      [
        "",
        `Created proxies in ${chalk.bold(pkg.name)}:`,
        `${created.join(", ")}`
      ].join("\n")
    );
  }
}

/**
 * @param {string} rootPath
 */
function hasTSConfig(rootPath) {
  return existsSync(join(rootPath, "tsconfig.json"));
}

/**
 * @param {import("ts-morph").Node<Node>} node
 */
function getEscapedName(node) {
  const symbol = node.getSymbol();
  return symbol && symbol.getEscapedName();
}

/**
 * @param {import("ts-morph").Node<Node>} node
 */
function isStateReturnDeclaration(node) {
  const kindName = node.getKindName();
  const escapedName = getEscapedName(node);
  return (
    kindName === "TypeAliasDeclaration" && /.+StateReturn$/.test(escapedName)
  );
}

/**
 * @param {import("ts-morph").Node<Node>} node
 */
function isInitialStateDeclaration(node) {
  const kindName = node.getKindName();
  const escapedName = getEscapedName(node);
  return (
    kindName === "TypeAliasDeclaration" && /.+InitialState$/.test(escapedName)
  );
}

/**
 * @param {import("ts-morph").Node<Node>} node
 */
function isOptionsDeclaration(node) {
  const kindName = node.getKindName();
  const escapedName = getEscapedName(node);
  return kindName === "TypeAliasDeclaration" && /.+Options$/.test(escapedName);
}

/**
 * @param {import("ts-morph").Node<Node>} node
 */
function isPropsDeclaration(node) {
  return isOptionsDeclaration(node) || isInitialStateDeclaration(node);
}

/**
 * @param {import("ts-morph").Node<Node>} node
 */
function getModuleName(node) {
  return getEscapedName(node)
    .replace("unstable_", "")
    .replace(/^(.+)InitialState$/, "use$1State")
    .replace("Options", "");
}

/**
 * @param {import("ts-morph").Symbol} symbol
 */
function getDeclaration(symbol) {
  const declarations = symbol.getDeclarations();
  return declarations[0];
}

/**
 * @param {import("ts-morph").Symbol} symbol
 */
function getJsDocs(symbol) {
  const jsDocs = getDeclaration(symbol).getJsDocs();
  return jsDocs[jsDocs.length - 1];
}

/**
 * @param {import("ts-morph").Symbol} symbol
 * @returns {string}
 */
function getComment(symbol) {
  const jsDocs = getJsDocs(symbol);
  if (!jsDocs) return "";
  return jsDocs.getComment();
}

/**
 * @param {import("ts-morph").Symbol} prop
 * @returns {string[]}
 */
function getTagNames(prop) {
  const jsDocs = getJsDocs(prop);
  if (!jsDocs) return [];
  return jsDocs.getTags().map(tag => tag.getTagName());
}

/**
 * @param {import("ts-morph").Node<Node>} node
 */
function getProps(node) {
  return node
    .getType()
    .getProperties()
    .filter(prop => !getTagNames(prop).includes("private"));
}

/**
 * @param {string} rootPath
 * @param {import("ts-morph").Symbol} prop
 */
function getPropType(rootPath, prop) {
  const declaration = getDeclaration(prop);
  const type = declaration
    .getType()
    .getText(undefined, ts.TypeFormatFlags.InTypeAlias);

  const encode = text =>
    text.replace(/[\u00A0-\u9999<>&"]/gim, i => `&#${i.charCodeAt(0)};`);

  if (type.length > 50) {
    return `<code title="${encode(type)}">${encode(
      type.substring(0, 47)
    )}...</code>`;
  }
  return `<code>${encode(type)}</code>`;
}

/**
 * @param {string} rootPath
 */
function getReadmePaths(rootPath) {
  const publicFiles = getPublicFiles(getSourcePath(rootPath));
  const readmePaths = Object.values(publicFiles).reduce((acc, filePath) => {
    const readmePath = join(dirname(filePath), "README.md");
    if (!acc.includes(readmePath) && existsSync(readmePath)) {
      return [...acc, readmePath];
    }
    return acc;
  }, []);
  return readmePaths;
}

/**
 * @param {string} dir
 */
function getPublicPathsInReadmeDir(dir) {
  return Object.values(getPublicFiles(dir)).sort((a, b) => {
    if (/State/.test(a)) return -1;
    if (/State/.test(b) || a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
}

/**
 * @param {string} rootPath
 * @param {import("ts-morph").Symbol} prop
 */
function createPropTypeObject(rootPath, prop) {
  return {
    name: prop.getEscapedName(),
    description: getComment(prop),
    type: getPropType(rootPath, prop)
  };
}

/**
 * @param {string} rootPath
 * @param {import("ts-morph").Node<Node>} node
 */
function createPropTypeObjects(rootPath, node) {
  return getProps(node).map(prop => createPropTypeObject(rootPath, prop));
}
/**
 * @param {import("ts-morph").SourceFile[]} sourceFiles
 */
function sortStateFirst(sourceFiles) {
  return sourceFiles.sort(a =>
    /State$/.test(a.getBaseNameWithoutExtension()) ? -1 : 0
  );
}

/**
 * @param {ReturnType<typeof createPropTypeObject>} prop
 */
function getPropTypesRow(prop) {
  const symbol = /unstable_/.test(prop.name)
    ? ' <span title="Experimental">⚠️</span>'
    : "";
  const name = `**\`${prop.name}\`**${symbol}`;

  return `- ${name}
  ${prop.type}

  ${prop.description}
`;
}

/**
 * @param {Record<string, ReturnType<typeof createPropTypeObject>>} types
 */
function getPropTypesMarkdown(types) {
  const content = Object.keys(types)
    .map(title => {
      const props = types[title];
      const rows = props.map(getPropTypesRow).join("\n");
      const stateProps = props.stateProps || [];
      const hiddenRows = stateProps.length
        ? `
<details><summary>${stateProps.length} state props</summary>

> These props are returned by the state hook. You can spread them into this component (\`{...state}\`) or pass them separately. You can also provide these props from your own state logic.

${stateProps.map(getPropTypesRow).join("\n")}
</details>`
        : "";

      return `
### \`${title}\`

${rows || (hiddenRows ? "" : "No props to show")}
${hiddenRows}`;
    })
    .join("\n\n");

  return `
<!-- Automatically generated -->
  
${content}`;
}

/**
 * Inject prop types tables into README.md files
 * @param {string} rootPath
 */
function injectPropTypes(rootPath) {
  const pkg = getPackage(rootPath);
  const readmePaths = getReadmePaths(rootPath);
  const stateTypes = [];
  const created = [];

  const project = new Project({
    tsConfigFilePath: join(rootPath, "tsconfig.json"),
    addFilesFromTsConfig: false
  });

  readmePaths.forEach(readmePath => {
    const mdContents = readFileSync(readmePath, { encoding: "utf-8" });

    if (/#\s?Props/.test(mdContents)) {
      const dir = dirname(readmePath);
      const tree = ast.parse(mdContents);
      const sourceFiles = project.addExistingSourceFiles(
        getPublicPathsInReadmeDir(dir)
      );
      project.resolveSourceFileDependencies();
      const types = {};

      sortStateFirst(sourceFiles).forEach(sourceFile => {
        sourceFile.forEachChild(node => {
          if (isStateReturnDeclaration(node)) {
            const propTypes = createPropTypeObjects(rootPath, node);
            stateTypes.push(...propTypes.map(prop => prop.name));
          }
          if (isPropsDeclaration(node)) {
            const moduleName = getModuleName(node);
            const propTypes = createPropTypeObjects(rootPath, node);

            if (isInitialStateDeclaration(node)) {
              types[moduleName] = propTypes;
            } else {
              const propTypesWithoutState = propTypes.filter(
                prop => !stateTypes.includes(prop.name)
              );
              const propTypesReturnedByState = propTypes.filter(prop =>
                stateTypes.includes(prop.name)
              );
              types[moduleName] = propTypesWithoutState;
              types[moduleName].stateProps = propTypesReturnedByState;
            }
          }
        });
      });

      const propTypesMarkdown = getPropTypesMarkdown(types);
      try {
        const merged = inject("Props", tree, ast.parse(propTypesMarkdown));
        const markdown = toMarkdown(merged).trimLeft();
        writeFileSync(readmePath, markdown);
        created.push(chalk.bold(chalk.green(basename(dir))));
      } catch (e) {
        // do nothing
      }
    }
  });

  if (created.length) {
    log(
      [
        "",
        `Injected prop types in ${chalk.bold(pkg.name)}:`,
        `${created.join(", ")}`
      ].join("\n")
    );
  }
}

module.exports = {
  getPackage,
  getModuleDir,
  getUnpkgDir,
  getTypesDir,
  getMainDir,
  getSourcePath,
  getPublicFiles,
  getProxyFolders,
  getBuildFolders,
  cleanBuild,
  getIndexPath,
  makeGitignore,
  makePlaygroundDeps,
  makeProxies,
  hasTSConfig,
  injectPropTypes
};
