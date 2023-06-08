import invariant from "tiny-invariant";
import { FunctionLikeDeclaration, Node, Project, ts } from "ts-morph";

const project = new Project({
  compilerOptions: {
    moduleResolution: ts.ModuleResolutionKind.Node16,
    jsx: ts.JsxEmit.ReactJSX,
  },
});

/**
 * @param {string} filename
 */
export function getReferences(filename) {
  let sourceFile = project.getSourceFile(filename);

  if (!sourceFile) {
    sourceFile = project.addSourceFileAtPath(filename);
    project.resolveSourceFileDependencies();
  } else {
    sourceFile.refreshFromFileSystemSync();
  }

  const exportedDecls = sourceFile.getExportedDeclarations();

  /** @type {import("./types.js").Reference[]} */
  const references = [];

  for (const [name, decls] of exportedDecls) {
    const decl = decls.at(0);
    if (!decl) continue;
    if (Node.isVariableDeclaration(decl)) {
      const options = exportedDecls.get(`${name}Options`)?.at(0);
      references.push(getReference(decl, options));
    } else if (Node.isFunctionDeclaration(decl)) {
      references.push(getReference(decl));
    }
  }

  return references.sort((a, b) => {
    if (a.name.startsWith("use")) return -1;
    if (b.name.startsWith("use")) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * @param {import("./types.js").Reference} reference
 */
export function getPageContent(reference) {
  const { name, description, examples, props } = reference;

  const requiredProps = props.filter((prop) => !prop.optional);
  const optionalProps = props.filter((prop) => prop.optional);

  /** @param {import("./types.js").ReferenceProp} prop */
  const renderProp = (prop) => {
    return `### \`${prop.name}\`

type: \`${prop.type}\`
${prop.defaultValue ? `<br />default: \`${prop.defaultValue}\`\n` : ""}
${prop.description}
`.trim();
  };

  const content = `# ${name}

<div data-description>

${description}

</div>

${examples
  .map((example) =>
    `\`\`\`${example.language}
${example.code}
\`\`\``.trim()
  )
  .join("\n\n")}
${
  requiredProps.length > 0
    ? `## Required Props

${requiredProps.map(renderProp).join("\n\n")}\n`
    : ""
}
${
  optionalProps.length > 0
    ? `## Optional Props

${optionalProps.map(renderProp).join("\n\n")}\n`
    : ""
}
`;

  return content;
}

const refs = getReferences("packages/ariakit-react/src/hovercard.ts");
const ref = refs.find((ref) => ref.name === "Hovercard");
if (ref) {
  console.log(getPageContent(ref));
}

/**
 * @template T
 * @param {T} value
 * @returns {value is NonNullable<T>}
 */
function nonNullable(value) {
  return value !== null && value !== undefined;
}

/**
 * @template {Node | import("ts-morph").JSDocStructure} T
 * @param {T} value
 * @returns {value is import("ts-morph").JSDocStructure}
 */
function isJSDocStructure(value) {
  return "tags" in value;
}

/**
 * @param {import("ts-morph").JSDocStructure[]} jsDocs
 */
function mergeJsDocs(jsDocs) {
  return jsDocs.reduce((merged, jsDoc) => {
    if (jsDoc.tags) {
      merged.tags = jsDoc.tags;
    }
    if (jsDoc.description) {
      merged.description = jsDoc.description;
    }
    return merged;
  });
}

/**
 * @param {Node | import("ts-morph").JSDocStructure} node
 * @returns {import("ts-morph").JSDocStructure | null}
 */
function getJsDoc(node) {
  if (isJSDocStructure(node)) return node;
  if (Node.isJSDoc(node)) return node.getStructure();
  if (!Node.isJSDocable(node)) return null;

  const jsDocs = node.getJsDocs();
  if (!jsDocs.length) return null;
  const jsDoc = mergeJsDocs(jsDocs.map((jsDoc) => jsDoc.getStructure()));

  if (Node.isPropertySignature(node)) {
    const parent = node.getParent();
    if (!parent) return jsDoc;
    const baseTypes = parent.getType().getBaseTypes();
    if (!baseTypes.length) return jsDoc;
    const jsDocs = baseTypes
      .map((type) => type.getProperty(node.getName())?.getDeclarations().at(0))
      .filter(nonNullable)
      .map(getJsDoc)
      .filter(nonNullable);

    return mergeJsDocs([...jsDocs, jsDoc]);
  }

  return jsDoc;
}

/**
 * @param {Node | import("ts-morph").JSDocStructure} node
 */
function getDescription(node) {
  const jsDoc = getJsDoc(node);
  if (!jsDoc) return "";
  return jsDoc.description?.toString().trim() || "";
}

/**
 * @param {Node | import("ts-morph").JSDocStructure} node
 */
function getTags(node) {
  const jsDoc = getJsDoc(node);
  if (!jsDoc) return [];
  return jsDoc.tags || [];
}

/**
 * @param {Node | ReturnType<typeof getTags>} node
 */
function isPrivate(node) {
  const tags = Array.isArray(node) ? node : getTags(node);
  return tags.some((tag) => tag.tagName === "private");
}

/**
 * @param {Node | ReturnType<typeof getTags>} node
 */
function getDeprecated(node) {
  const tags = Array.isArray(node) ? node : getTags(node);
  const tag = tags.find((tag) => tag.tagName === "deprecated");
  if (!tag) return false;
  return tag.text?.toString() || true;
}

/**
 * @param {Node | ReturnType<typeof getTags>} node
 */
function getDefaultValue(node) {
  const tags = Array.isArray(node) ? node : getTags(node);
  const tag = tags.find((tag) => tag.tagName === "default");
  return tag?.text?.toString().trim() ?? null;
}

/**
 * @param {Node} node
 */
function getType(node) {
  return node
    .getType()
    .getText(undefined, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
}

/**
 * @param {Node | ReturnType<typeof getTags>} node
 */
function getExamples(node) {
  const tags = Array.isArray(node) ? node : getTags(node);

  /** @type {import("./types.js").ReferenceExample[]} */
  const examples = [];

  tags.forEach((tag) => {
    if (tag.tagName === "example") {
      const text = tag.text?.toString();
      if (!text) return;
      const match = text.match(
        /^(?<description>(.|\n)*)```(?<language>[^\n]+)\n(?<code>(.|\n)+)\n```$/m
      );
      examples.push({
        description: (match?.groups?.description || "").trim(),
        language: match?.groups?.language || "jsx",
        code: (match?.groups?.code || text).trim(),
      });
    }
  });

  return examples;
}

/**
 * @param {Node} node
 */
function getProps(node) {
  const nodeProps = node.getType().getProperties();

  /** @type {import("./types.js").ReferenceProp[]} */
  const props = [];

  for (const prop of nodeProps) {
    const decl = prop.getDeclarations().at(0);
    if (!decl) continue;
    if (isPrivate(decl)) continue;
    props.push({
      name: prop.getEscapedName(),
      type: getType(decl),
      description: getDescription(decl),
      optional: prop.isOptional(),
      defaultValue: getDefaultValue(decl),
      deprecated: getDeprecated(decl),
      examples: getExamples(decl),
    });
  }

  return props;
}

/**
 * @param {Node} node
 */
function getFunction(node) {
  if (Node.isFunctionLikeDeclaration(node)) return node;
  /** @type {FunctionLikeDeclaration} */
  return node.getFirstDescendant(Node.isFunctionLikeDeclaration);
}

/**
 * @param {Node} node
 */
function getNodeName(node) {
  if (Node.isVariableStatement(node)) {
    const [decl] = node.getDeclarations();
    invariant(decl);
    return decl.getName();
  }
  return node.getSymbolOrThrow().getName();
}

/**
 * @param {Node} node
 * @param {Node} [props]
 * @param {Node} [returnedProps]
 * @returns {import("./types.js").Reference}
 */
function getReference(node, props, returnedProps) {
  node = Node.isVariableDeclaration(node)
    ? node.getVariableStatementOrThrow()
    : node;

  props = props || getFunction(node)?.getParameters()?.at(0);
  returnedProps = returnedProps || getFunction(node)?.getReturnTypeNode();

  return {
    name: getNodeName(node),
    description: getDescription(node),
    deprecated: getDeprecated(node),
    examples: getExamples(node),
    props: props ? getProps(props) : [],
    returnProps: returnedProps ? getProps(returnedProps) : undefined,
  };
}
