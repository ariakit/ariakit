// @ts-check
const { Node, ts } = require("ts-morph");

/**
 * @param {import("ts-morph").Node | import("ts-morph").JSDoc} nodeOrJsDoc
 */
function getJsDoc(nodeOrJsDoc) {
  if (Node.isJSDoc(nodeOrJsDoc)) return nodeOrJsDoc;
  if (!Node.isJSDocable(nodeOrJsDoc)) return null;
  const jsDocs = nodeOrJsDoc.getJsDocs();
  return jsDocs[jsDocs.length - 1];
}

/**
 * @param {import("ts-morph").Node | import("ts-morph").JSDoc} nodeOrJsDoc
 */
function getDescription(nodeOrJsDoc) {
  const jsDoc = getJsDoc(nodeOrJsDoc);
  if (!jsDoc) return "";
  return jsDoc
    .getDescription()
    .trim()
    .replace(/\n([^\n])/g, " $1");
}

/**
 * @param {import("ts-morph").Node | import("ts-morph").JSDoc} nodeOrJsDoc
 */
function getTags(nodeOrJsDoc) {
  const jsDoc = getJsDoc(nodeOrJsDoc);
  if (!jsDoc) return [];
  return jsDoc.getTags();
}

/**
 * @param {import("ts-morph").Node | import("ts-morph").JSDoc} nodeOrJsDoc
 */
function shouldBeIgnored(nodeOrJsDoc) {
  return getTags(nodeOrJsDoc).some((tag) => tag.getTagName() === "ignore");
}

/**
 * @param {import("ts-morph").Node | import("ts-morph").JSDoc} nodeOrJsDoc
 */
function isOptional(nodeOrJsDoc) {
  const type = nodeOrJsDoc.getType().getText();
  return type.endsWith(" | undefined");
}

/**
 * @param {import("ts-morph").Node | import("ts-morph").JSDoc} nodeOrJsDoc
 */
function getType(nodeOrJsDoc) {
  const type = nodeOrJsDoc
    .getType()
    .getText(
      nodeOrJsDoc,
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
    );
  return type.replace(/ \| undefined$/, "");
}

/**
 * @param {import("ts-morph").JSDocTag[]} tags
 */
function getExamples(tags) {
  /** @type {Array<import("./types").APIExample>} */
  const examples = [];
  tags.forEach((tag) => {
    if (tag.getTagName() === "example") {
      const text = tag.getCommentText();
      if (text) {
        const match = text.match(
          /^(?<description>(.|\n)*)```(?<language>[^\n]+)\n(?<code>(.|\n)+)\n```$/m
        );
        examples.push({
          description: (match?.groups?.description || "").trim(),
          language: match?.groups?.language || "jsx",
          code: (match?.groups?.code || text).trim(),
        });
      }
    }
  });
  return examples;
}

/**
 * @param {import("ts-morph").JSDocTag[]} tags
 */
function getDefaultValue(tags) {
  const tag = tags.find((tag) => tag.getTagName() === "default");
  return tag?.getCommentText() ?? null;
}

/**
 * @param {import("ts-morph").JSDocTag[]} tags
 */
function getDeprecated(tags) {
  const tag = tags.find((tag) => tag.getTagName() === "deprecated");
  if (!tag) return false;
  return tag.getCommentText() || true;
}

/**
 * @param {import("ts-morph").Node} node
 */
function getProps(node) {
  const nodeProps = node.getType().getProperties();
  /** @type {Array<import("./types").APIProp>} */
  const props = [];
  for (const prop of nodeProps) {
    const [decl] = prop.getDeclarations();
    if (shouldBeIgnored(decl)) continue;
    const tags = getTags(decl);
    props.push({
      name: prop.getEscapedName(),
      type: getType(decl),
      description: getDescription(decl),
      optional: isOptional(decl),
      examples: getExamples(tags),
      defaultValue: getDefaultValue(tags),
      deprecated: getDeprecated(tags),
    });
  }
  return props;
}

module.exports = {
  getJsDoc,
  getDescription,
  getTags,
  shouldBeIgnored,
  isOptional,
  getType,
  getExamples,
  getDefaultValue,
  getDeprecated,
  getProps,
};
