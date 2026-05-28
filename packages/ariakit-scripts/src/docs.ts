import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, isAbsolute, join, resolve } from "node:path";
import {
  Node,
  Project,
  SyntaxKind,
  type FunctionDeclaration,
  type InterfaceDeclaration,
  type SourceFile,
  type TypeAliasDeclaration,
} from "ts-morph";

interface GenerateDocsOptions {
  rootPath?: string;
  entry?: string;
  tsconfig?: string;
}

interface InjectDocsOptions extends GenerateDocsOptions {
  readme?: string;
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

type LocalTypeDeclaration = InterfaceDeclaration | TypeAliasDeclaration;

const startMarker = "<!-- ariakit-docs:start -->";
const endMarker = "<!-- ariakit-docs:end -->";
const maxDeclarationLines = 24;
const declarationHeadLines = 14;
const declarationTailLines = 4;

function resolvePath(rootPath: string, path: string) {
  if (isAbsolute(path)) return path;
  return resolve(rootPath, path);
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

function getApiGroups(entrySourceFile: SourceFile) {
  const entries = [...entrySourceFile.getExportedDeclarations()]
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
  return text
    ?.trim()
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
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

function referencesIdentifier(text: string, name: string) {
  return new RegExp(`\\b${name}\\b`).test(text);
}

function formatLocalTypeDeclaration(declaration: LocalTypeDeclaration) {
  return truncateDeclarationText(
    removeExportKeyword(removeJsDoc(declaration.getText()).trim()),
  );
}

function getReferencedLocalTypes(text: string, declarations: Node[]) {
  const localTypes = new Map<string, LocalTypeDeclaration>();
  for (const declaration of declarations) {
    for (const localType of getLocalTypeDeclarations(
      declaration.getSourceFile(),
    )) {
      const path = localType.getSourceFile().getFilePath();
      localTypes.set(`${path}:${localType.getName()}`, localType);
    }
  }
  const referencedTypes = new Map<string, LocalTypeDeclaration>();
  let searchText = text;

  let foundReference = true;
  while (foundReference) {
    foundReference = false;

    for (const [key, declaration] of localTypes) {
      const name = declaration.getName();
      if (referencedTypes.has(key)) continue;
      if (!referencesIdentifier(searchText, name)) continue;

      referencedTypes.set(key, declaration);
      searchText += `\n${declaration.getText()}`;
      foundReference = true;
    }
  }

  return [...referencedTypes.values()].sort(
    (a, b) => a.getStart() - b.getStart(),
  );
}

function addReferencedLocalTypes(signatures: string[], declarations: Node[]) {
  const referencedTypes = getReferencedLocalTypes(
    signatures.join("\n"),
    declarations,
  );
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
    const signatures = functionDeclarations.map(formatFunctionSignature);
    return addReferencedLocalTypes(signatures, functionDeclarations);
  }

  const [declaration] = entry.declarations;
  if (!declaration) return [];

  const variableSignature = formatVariableSignature(declaration);
  if (variableSignature) {
    return addReferencedLocalTypes(
      [truncateDeclarationText(variableSignature)],
      [declaration],
    );
  }

  return addReferencedLocalTypes(
    [formatDeclarationText(declaration)],
    [declaration],
  );
}

function renderCodeBlock(code: string) {
  return ["```ts", code, "```"].join("\n");
}

function isFencedCodeBlock(code: string) {
  return /^```[\s\S]*\n```$/.test(code.trim());
}

function renderExample(example: string) {
  if (isFencedCodeBlock(example)) return example.trim();
  return renderCodeBlock(example);
}

function renderEntry(entry: ApiEntry) {
  const jsDoc = getJsDocParts(entry.declarations);
  const signatures = getEntrySignatures(entry);
  const lines = [`#### \`${entry.name}\``, ""];

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

function renderContents(groups: ApiGroup[]) {
  return groups
    .flatMap((group) => {
      if (!group.title) return [];
      return `- [${group.title}](#${slugifyHeading(group.title)})`;
    })
    .join("\n");
}

function renderGroup(group: ApiGroup) {
  const lines = group.title ? [`### ${group.title}`, ""] : [];

  if (group.description) {
    lines.push(group.description, "");
  }

  for (const entry of group.entries) {
    lines.push(renderEntry(entry), "");
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
  const groups = getApiGroups(entrySourceFile);
  const lines = ["## API reference", ""];

  const contents = renderContents(groups);
  if (contents) {
    lines.push(contents, "");
  }

  for (const group of groups) {
    lines.push(renderGroup(group), "");
  }

  return formatMarkdown(`${lines.join("\n").trimEnd()}\n`);
}

export function injectDocsMarkdown(options: InjectDocsOptions = {}) {
  const rootPath = options.rootPath || process.cwd();
  const readmePath = resolvePath(rootPath, options.readme || "readme.md");
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
    const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
    if (!pattern.test(readme)) {
      throw new Error(
        `${startMarker} must appear before ${endMarker} in ${readmePath}`,
      );
    }
    nextReadme = readme.replace(pattern, block);
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
