import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, isAbsolute, join, resolve } from "node:path";
import { Node, Project, SyntaxKind } from "ts-morph";
import type {
  FunctionDeclaration,
  InterfaceDeclaration,
  SourceFile,
  TypeAliasDeclaration,
} from "ts-morph";
import { escapeRegExp } from "./regexp.ts";

interface GenerateDocsOptions {
  rootPath?: string;
  entry?: string;
  tsconfig?: string;
  heading?: string;
  exclude?: string[];
}

interface InjectDocsOptions extends GenerateDocsOptions {
  readme?: string;
  marker?: string;
}

interface DocsOptions extends InjectDocsOptions {
  write?: boolean;
}

interface ApiEntry {
  name: string;
  declarations: Node[];
}

interface ApiGroup {
  description?: string;
  entries: ApiEntry[];
  title?: string;
}

interface JsDocParts {
  description?: string;
  examples: string[];
  returns?: string;
  see: string[];
}

interface JsDocTag {
  getCommentText(): string | undefined;
  getTagName(): string;
  getText(): string;
}

interface ModuleInfo {
  description?: string;
  title: string;
}

interface SignatureItem {
  declarations: Node[];
  text: string;
}

type LocalTypeDeclaration = InterfaceDeclaration | TypeAliasDeclaration;

const defaultHeading = "API reference";
const maxDeclarationLines = 24;
const declarationHeadLines = 14;
const declarationTailLines = 4;

function resolvePath(rootPath: string, path: string) {
  if (isAbsolute(path)) return path;
  return resolve(rootPath, path);
}

export function getDocsMarkers(name = "") {
  const suffix = name ? ` ${name}` : "";
  return {
    start: `<!-- ariakit-docs:start${suffix} -->`,
    end: `<!-- ariakit-docs:end${suffix} -->`,
  };
}

function getTsConfigPath(rootPath: string, path?: string) {
  if (path) return resolvePath(rootPath, path);

  const nodeConfigPath = join(rootPath, "tsconfig.node.json");
  if (existsSync(nodeConfigPath)) return nodeConfigPath;

  const configPath = join(rootPath, "tsconfig.json");
  if (existsSync(configPath)) return configPath;

  return undefined;
}

function createProject(rootPath: string, path?: string) {
  const tsConfigFilePath = getTsConfigPath(rootPath, path);
  if (!tsConfigFilePath) return new Project();
  return new Project({ tsConfigFilePath });
}

function getEntrySourceFile(project: Project, entryPath: string) {
  return (
    project.getSourceFile(entryPath) || project.addSourceFileAtPath(entryPath)
  );
}

function getFallbackModuleTitle(sourceFile: SourceFile) {
  const name = basename(
    sourceFile.getFilePath(),
    extname(sourceFile.getFilePath()),
  );
  const words = name.split(/[-_]/g).filter(Boolean);
  return words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function getModuleInfo(sourceFile: SourceFile): ModuleInfo | undefined {
  const text = sourceFile.getFullText();
  const [firstStatement] = sourceFile.getStatements();
  const fileHeader = firstStatement
    ? text.slice(0, firstStatement.getStart())
    : text;
  const jsDocPattern = /\/\*\*([\s\S]*?)\*\//g;

  for (const match of fileHeader.matchAll(jsDocPattern)) {
    const content = normalizeJsDocTagText(match[1] ?? "");
    const lines = content.split("\n");
    const descriptionLines: string[] = [];
    let title: string | undefined;

    for (const line of lines) {
      if (line.startsWith("@module")) {
        title = line.replace(/^@module\s*/, "").trim();
        continue;
      }
      if (line.startsWith("@")) continue;
      descriptionLines.push(line);
    }

    if (title == null) continue;

    return {
      title: title || getFallbackModuleTitle(sourceFile),
      description: normalizeComment(descriptionLines.join("\n")),
    };
  }

  return undefined;
}

function addGroup(
  groups: ApiGroup[],
  moduleInfo: ModuleInfo | undefined,
  entries: ApiEntry[],
) {
  if (!entries.length) return;

  const title = moduleInfo?.title;
  const group = groups.find((group) => group.title === title);

  if (group) {
    const names = new Set(group.entries.map((entry) => entry.name));
    for (const entry of entries) {
      if (names.has(entry.name)) continue;
      group.entries.push(entry);
      names.add(entry.name);
    }
    return;
  }

  groups.push({ title, description: moduleInfo?.description, entries });
}

function getFirstDeclaration(entry: ApiEntry) {
  return entry.declarations[0];
}

function compareEntries(a: ApiEntry, b: ApiEntry) {
  const declarationA = getFirstDeclaration(a);
  const declarationB = getFirstDeclaration(b);

  if (!declarationA || !declarationB) return 0;

  const fileComparison = declarationA
    .getSourceFile()
    .getFilePath()
    .localeCompare(declarationB.getSourceFile().getFilePath());

  if (fileComparison) return fileComparison;
  return declarationA.getStart() - declarationB.getStart();
}

function getExcludeSourceFile(
  project: Project,
  entrySourceFile: SourceFile,
  exclude: string,
  rootPath: string,
) {
  // Prefer the module the entry re-exports under this specifier so excluding
  // an external package like `@playwright/test` resolves to its declarations.
  for (const declaration of entrySourceFile.getExportDeclarations()) {
    if (declaration.getModuleSpecifierValue() !== exclude) continue;
    const sourceFile = declaration.getModuleSpecifierSourceFile();
    if (sourceFile) return sourceFile;
  }

  // Otherwise treat the value as a file path relative to the package root.
  const path = resolvePath(rootPath, exclude);
  if (!existsSync(path)) return undefined;
  return project.getSourceFile(path) || project.addSourceFileAtPath(path);
}

function getExcludedNames(
  project: Project,
  entrySourceFile: SourceFile,
  excludes: string[],
  rootPath: string,
) {
  const names = new Set<string>();

  for (const exclude of excludes) {
    const sourceFile = getExcludeSourceFile(
      project,
      entrySourceFile,
      exclude,
      rootPath,
    );
    // Fail fast on a misconfigured exclude. Skipping silently would leave the
    // re-exported declarations in the output, and the readme sync check would
    // not catch it because it applies the same exclude on both sides.
    if (!sourceFile) {
      throw new Error(`Could not resolve --exclude entry "${exclude}"`);
    }
    for (const [name] of sourceFile.getExportedDeclarations()) {
      names.add(name);
    }
  }

  return names;
}

function getApiGroups(entrySourceFile: SourceFile, excludedNames: Set<string>) {
  const entries = [...entrySourceFile.getExportedDeclarations()]
    .filter(([name]) => !excludedNames.has(name))
    .map(([name, declarations]) => ({ name, declarations }))
    .sort(compareEntries);
  const moduleInfoByFile = new Map<string, ModuleInfo | undefined>();
  const groups: ApiGroup[] = [];

  const getCachedModuleInfo = (sourceFile: SourceFile) => {
    const path = sourceFile.getFilePath();
    if (!moduleInfoByFile.has(path)) {
      moduleInfoByFile.set(path, getModuleInfo(sourceFile));
    }
    return moduleInfoByFile.get(path);
  };

  const hasModules = entries.some((entry) => {
    const declaration = getFirstDeclaration(entry);
    if (!declaration) return false;
    return !!getCachedModuleInfo(declaration.getSourceFile());
  });

  if (!hasModules) {
    return [{ entries }];
  }

  for (const entry of entries) {
    const declaration = getFirstDeclaration(entry);
    if (!declaration) continue;
    const sourceFile = declaration.getSourceFile();
    const moduleInfo = getCachedModuleInfo(sourceFile) ?? {
      title: "Other exports",
    };
    addGroup(groups, moduleInfo, [entry]);
  }

  return groups;
}

function normalizeComment(text: string | undefined) {
  const result = text
    ?.trim()
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");

  return result || undefined;
}

function normalizeJsDocTagText(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .join("\n")
    .trim();
}

function getTagComment(tag: JsDocTag) {
  const tagName = tag.getTagName();
  const comment = normalizeComment(tag.getCommentText());
  if (tagName !== "see" && comment) return comment;

  const rawText = tag.getText();
  let rawComment = normalizeJsDocTagText(
    rawText.replace(new RegExp(`^@${tagName}\\b`), ""),
  );
  if (tagName === "returns" || tagName === "return") {
    rawComment = rawComment.replace(/^\{[^}]+\}\s*/, "");
  }
  return normalizeComment(rawComment) || comment;
}

function getJsDocNodes(declaration: Node) {
  const nodes = [declaration];
  const variableStatement = declaration.getFirstAncestorByKind(
    SyntaxKind.VariableStatement,
  );

  if (variableStatement) {
    nodes.push(variableStatement);
  }

  return nodes;
}

function getJsDocParts(declarations: Node[]): JsDocParts {
  const parts: JsDocParts = { examples: [], see: [] };

  for (const declaration of declarations) {
    for (const node of getJsDocNodes(declaration)) {
      if (!Node.isJSDocable(node)) continue;

      const docs = node.getJsDocs().filter((doc) => {
        return !doc.getTags().some((tag) => tag.getTagName() === "module");
      });

      for (const doc of docs) {
        parts.description ??= normalizeComment(doc.getDescription());

        for (const tag of doc.getTags()) {
          const tagName = tag.getTagName();
          if (tagName === "example") {
            const example = tag.getCommentText()?.trim() ?? getTagComment(tag);
            if (example) {
              parts.examples.push(example);
            }
            continue;
          }

          const comment = getTagComment(tag);
          if (!comment) continue;

          if (tagName === "returns" || tagName === "return") {
            parts.returns ??= comment;
          } else if (tagName === "see") {
            parts.see.push(comment);
          }
        }
      }
    }
  }

  return parts;
}

function formatTypeParameters(declaration: FunctionDeclaration) {
  const typeParameters = declaration.getTypeParameters();
  if (!typeParameters.length) return "";
  return `<${typeParameters.map((typeParameter) => typeParameter.getText()).join(", ")}>`;
}

function formatReturnType(declaration: FunctionDeclaration) {
  const returnType = declaration.getReturnTypeNode()?.getText();
  const inferredReturnType = declaration.getReturnType().getText(declaration);
  const text = returnType || inferredReturnType;
  if (!text) return "";
  return `: ${text}`;
}

function formatFunctionSignature(declaration: FunctionDeclaration) {
  const name = declaration.getName() || "default";
  const parameters = declaration
    .getParameters()
    .map((parameter) => parameter.getText())
    .join(", ");

  return [
    "function ",
    name,
    formatTypeParameters(declaration),
    "(",
    parameters,
    ")",
    formatReturnType(declaration),
    ";",
  ].join("");
}

function removeJsDoc(text: string) {
  return text.replace(/^\/\*\*[\s\S]*?\*\/\s*/, "");
}

function removeExportKeyword(text: string) {
  return text.replace(/^export\s+/, "");
}

function truncateDeclarationText(text: string) {
  const lines = text.split("\n");
  if (lines.length <= maxDeclarationLines) return text;

  const omittedLines =
    lines.length - declarationHeadLines - declarationTailLines;
  if (omittedLines <= 0) return text;

  const indentation = lines[declarationHeadLines]?.match(/^\s*/)?.[0] ?? "";

  return [
    ...lines.slice(0, declarationHeadLines),
    `${indentation}// ... ${omittedLines} more lines`,
    ...lines.slice(-declarationTailLines),
  ].join("\n");
}

function getLocalTypeDeclarations(sourceFile: SourceFile) {
  return [...sourceFile.getTypeAliases(), ...sourceFile.getInterfaces()]
    .filter((declaration) => !declaration.isExported())
    .sort((a, b) => a.getStart() - b.getStart());
}

function getTypeParameterNames(declaration: Node) {
  const names = new Set<string>();

  if (
    !Node.isFunctionDeclaration(declaration) &&
    !Node.isInterfaceDeclaration(declaration) &&
    !Node.isTypeAliasDeclaration(declaration)
  ) {
    return names;
  }

  for (const typeParameter of declaration.getTypeParameters()) {
    names.add(typeParameter.getName());
  }

  return names;
}

function referencesIdentifier(text: string, name: string) {
  const identifierCharacter = "A-Za-z0-9_$";
  return new RegExp(
    `(^|[^${identifierCharacter}])${escapeRegExp(name)}(?=$|[^${identifierCharacter}])`,
  ).test(text);
}

function formatLocalTypeDeclaration(declaration: LocalTypeDeclaration) {
  return truncateDeclarationText(
    removeExportKeyword(removeJsDoc(declaration.getText()).trim()),
  );
}

function getSignatureTypeParameterNames(declarations: Node[]) {
  const names = new Set<string>();
  for (const declaration of declarations) {
    for (const name of getTypeParameterNames(declaration)) {
      names.add(name);
    }
  }
  return names;
}

function getReferencedLocalTypes(items: SignatureItem[]) {
  const localTypes = new Map<string, LocalTypeDeclaration>();
  for (const item of items) {
    for (const declaration of item.declarations) {
      for (const localType of getLocalTypeDeclarations(
        declaration.getSourceFile(),
      )) {
        const path = localType.getSourceFile().getFilePath();
        localTypes.set(`${path}:${localType.getName()}`, localType);
      }
    }
  }

  const searchItems = items.map((item) => ({
    ...item,
    typeParameterNames: getSignatureTypeParameterNames(item.declarations),
  }));
  const referencedTypes = new Map<string, LocalTypeDeclaration>();

  let foundReference = true;
  while (foundReference) {
    foundReference = false;

    for (const item of searchItems) {
      for (const [key, declaration] of localTypes) {
        const name = declaration.getName();
        if (referencedTypes.has(key)) continue;
        if (item.typeParameterNames.has(name)) continue;
        if (!referencesIdentifier(item.text, name)) continue;

        referencedTypes.set(key, declaration);
        searchItems.push({
          declarations: [declaration],
          text: declaration.getText(),
          typeParameterNames: getTypeParameterNames(declaration),
        });
        foundReference = true;
      }
    }
  }

  return [...referencedTypes.values()].sort(
    (a, b) => a.getStart() - b.getStart(),
  );
}

function addReferencedLocalTypes(items: SignatureItem[]) {
  const referencedTypes = getReferencedLocalTypes(items);
  const signatures = items.map((item) => item.text);
  const localTypeSignatures = referencedTypes
    .map(formatLocalTypeDeclaration)
    .join("\n\n");

  if (!localTypeSignatures) return signatures;
  return [localTypeSignatures, "", ...signatures];
}

function formatDeclarationText(declaration: Node) {
  return truncateDeclarationText(
    removeExportKeyword(removeJsDoc(declaration.getText()).trim()),
  );
}

function formatVariableSignature(declaration: Node) {
  if (!Node.isVariableDeclaration(declaration)) return;
  const name = declaration.getName();
  const type = declaration.getType().getText(declaration);
  return `const ${name}: ${type};`;
}

function getFunctionSignatureDeclarations(declarations: Node[]) {
  const functions = declarations.filter(Node.isFunctionDeclaration);
  if (!functions.length) return [];

  const overloads = functions.filter((declaration) => !declaration.getBody());
  return overloads.length ? overloads : functions.slice(0, 1);
}

function getEntrySignatures(entry: ApiEntry) {
  const functionDeclarations = getFunctionSignatureDeclarations(
    entry.declarations,
  );
  if (functionDeclarations.length) {
    return addReferencedLocalTypes(
      functionDeclarations.map((declaration) => ({
        declarations: [declaration],
        text: formatFunctionSignature(declaration),
      })),
    );
  }

  const [declaration] = entry.declarations;
  if (!declaration) return [];

  const variableSignature = formatVariableSignature(declaration);
  if (variableSignature) {
    return addReferencedLocalTypes([
      {
        declarations: [declaration],
        text: truncateDeclarationText(variableSignature),
      },
    ]);
  }

  return addReferencedLocalTypes([
    {
      declarations: [declaration],
      text: formatDeclarationText(declaration),
    },
  ]);
}

function renderCodeBlock(code: string) {
  return ["```ts", code, "```"].join("\n");
}

function hasFencedCodeBlock(code: string) {
  return /(^|\n)```/.test(code.trim());
}

function renderExample(example: string) {
  const trimmed = example.trim();
  // Examples that already contain a fenced code block (optionally with
  // surrounding prose) are treated as Markdown and emitted as-is. Wrapping
  // them in another code fence would nest fences and break rendering.
  if (hasFencedCodeBlock(trimmed)) return trimmed;
  return renderCodeBlock(trimmed);
}

function renderBackToTop(anchor: string) {
  return [
    '<div align="right">',
    `  <a href="#${anchor}">&uarr; back to top</a>`,
    "</div>",
  ].join("\n");
}

function renderEntry(entry: ApiEntry, heading: string, topAnchor: string) {
  const jsDoc = getJsDocParts(entry.declarations);
  const signatures = getEntrySignatures(entry);
  const lines = [`${heading} \`${entry.name}\``, ""];

  if (signatures.length) {
    lines.push(renderCodeBlock(signatures.join("\n")), "");
  }

  if (jsDoc.description) {
    lines.push(jsDoc.description, "");
  }

  if (jsDoc.returns) {
    lines.push(`Returns: ${jsDoc.returns}`, "");
  }

  for (const see of jsDoc.see) {
    lines.push(`See: ${see}`, "");
  }

  for (const example of jsDoc.examples) {
    lines.push("Example:", "", renderExample(example), "");
  }

  lines.push(renderBackToTop(topAnchor));

  return lines.join("\n").trimEnd();
}

function slugifyHeading(heading: string) {
  return heading
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Mirrors how GitHub (`github-slugger`) assigns heading anchors: the first
// heading with a given slug keeps it, and later collisions get a `-1`, `-2`,
// ... suffix, probing until the slug is unused so a generated suffix never
// clashes with a natural slug (e.g. `foo`, `foo-1`, `foo` -> `foo-2`). Headings
// must be slugged in the order the body renders them so the table of contents
// links match. This matters for case-only collisions such as `wrapInstance`
// and `WrapInstance`, which share a lowercased slug.
function createSlugger() {
  const occurrences = new Map<string, number>();
  return (heading: string) => {
    const base = slugifyHeading(heading);
    let slug = base;
    while (occurrences.has(slug)) {
      const next = (occurrences.get(base) ?? 0) + 1;
      occurrences.set(base, next);
      slug = `${base}-${next}`;
    }
    occurrences.set(slug, 0);
    return slug;
  };
}

function renderContents(groups: ApiGroup[]) {
  const entryCount = groups.reduce(
    (count, group) => count + group.entries.length,
    0,
  );
  // A single entry has nothing to navigate, so the table of contents is noise.
  if (entryCount <= 1) return "";

  const slug = createSlugger();
  const renderEntryContents = (entry: ApiEntry, indent: string) =>
    `${indent}- [\`${entry.name}\`](#${slug(entry.name)})`;

  return groups
    .flatMap((group) => {
      // Without a module title, list the members at the top level. With one,
      // nest the members under a link to the module heading.
      if (!group.title) {
        return group.entries.map((entry) => renderEntryContents(entry, ""));
      }
      return [
        `- [${group.title}](#${slug(group.title)})`,
        ...group.entries.map((entry) => renderEntryContents(entry, "  ")),
      ];
    })
    .join("\n");
}

function renderGroup(
  group: ApiGroup,
  memberHeading: string,
  topAnchor: string,
) {
  const lines = group.title ? [`### ${group.title}`, ""] : [];

  if (group.description) {
    lines.push(group.description, "");
  }

  for (const entry of group.entries) {
    lines.push(renderEntry(entry, memberHeading, topAnchor), "");
  }

  return lines.join("\n").trimEnd();
}

function formatMarkdown(markdown: string) {
  const result = spawnSync("oxfmt", ["--stdin-filepath", "readme.md"], {
    encoding: "utf-8",
    input: markdown,
  });

  if (result.error) return markdown;
  if (result.status) return markdown;
  return result.stdout || markdown;
}

export function generateDocsMarkdown(options: GenerateDocsOptions = {}) {
  const rootPath = options.rootPath || process.cwd();
  const entryPath = resolvePath(rootPath, options.entry || "src/index.ts");
  const project = createProject(rootPath, options.tsconfig);
  const entrySourceFile = getEntrySourceFile(project, entryPath);
  const excludedNames = getExcludedNames(
    project,
    entrySourceFile,
    options.exclude || [],
    rootPath,
  );
  const groups = getApiGroups(entrySourceFile, excludedNames);
  const heading = options.heading || defaultHeading;
  const lines = [`## ${heading}`, ""];

  const contents = renderContents(groups);
  if (contents) {
    lines.push(contents, "");
  }

  // Members sit one level below their heading. With modules they nest under a
  // `### Module` heading; without modules they sit directly under the `##`
  // section heading, so they use `###` to keep the heading levels incremental.
  const hasModules = groups.some((group) => group.title);
  const memberHeading = hasModules ? "####" : "###";
  // Each member links back to the section heading (which sits above the table
  // of contents), e.g. `#api-reference` or `#playwright-api-reference`.
  const topAnchor = slugifyHeading(heading);

  for (const group of groups) {
    lines.push(renderGroup(group, memberHeading, topAnchor), "");
  }

  return formatMarkdown(`${lines.join("\n").trimEnd()}\n`);
}

export function injectDocsMarkdown(options: InjectDocsOptions = {}) {
  const rootPath = options.rootPath || process.cwd();
  const readmePath = resolvePath(rootPath, options.readme || "readme.md");
  const { start: startMarker, end: endMarker } = getDocsMarkers(options.marker);
  const markdown = generateDocsMarkdown(options).trimEnd();
  const readme = readFileSync(readmePath, "utf-8");
  const block = `${startMarker}\n\n${markdown}\n\n${endMarker}`;
  const hasStartMarker = readme.includes(startMarker);
  const hasEndMarker = readme.includes(endMarker);

  let nextReadme: string;

  if (hasStartMarker !== hasEndMarker) {
    throw new Error(
      `Both ${startMarker} and ${endMarker} must be present in ${readmePath}`,
    );
  }

  if (hasStartMarker && hasEndMarker) {
    const pattern = new RegExp(
      `${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`,
    );
    if (!pattern.test(readme)) {
      throw new Error(
        `${startMarker} must appear before ${endMarker} in ${readmePath}`,
      );
    }
    nextReadme = readme.replace(pattern, () => block);
  } else {
    nextReadme = `${readme.trimEnd()}\n\n${block}\n`;
  }

  if (nextReadme !== readme) {
    writeFileSync(readmePath, nextReadme);
  }
}

export function docs(options: DocsOptions = {}) {
  if (options.write) {
    injectDocsMarkdown(options);
    return;
  }

  console.log(generateDocsMarkdown(options).trimEnd());
}
