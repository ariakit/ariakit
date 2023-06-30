import { readFileSync } from "fs";
import { basename, extname } from "path";
import { getPageName } from "./get-page-name.js";
import { pathToPosix } from "./path-to-posix.js";

/**
 * Gets the page tree from a file path.
 * @param {string | import("./types.js").Reference} filename
 */
export function getPageContent(filename) {
  if (typeof filename !== "string") {
    return createReferencePageContent(filename);
  }
  const isMarkdown = extname(filename) === ".md";
  const content = isMarkdown
    ? readFileSync(filename, "utf8")
    : createPageContent(filename);
  return content;
}

/**
 * Creates a page content string from a file path.
 * @param {string} filename
 */
function createPageContent(filename) {
  const title = getPageName(filename);
  const importPath = pathToPosix(basename(filename));
  const content = `# ${title}
<a href="./${importPath}" data-playground>Example</a>`;
  return content;
}

/**
 * @param {import("./types.js").Reference} reference
 */
export function createReferencePageContent(reference) {
  const { name, description, examples, props, deprecated, returnProps } =
    reference;

  /**
   * @param {import("./types.js").ReferenceProp} a
   * @param {import("./types.js").ReferenceProp} b
   */
  const sortProp = (a, b) => {
    if (a.deprecated && !b.deprecated) return 1;
    if (!a.deprecated && b.deprecated) return -1;
    return a.name.localeCompare(b.name);
  };

  const requiredProps = props.filter((prop) => !prop.optional).sort(sortProp);
  const optionalProps = props
    .filter((prop) => prop.optional && prop.name !== "as")
    .sort(sortProp);

  /** @param {import("./types.js").ReferenceProp} prop */
  const renderProp = (prop) => {
    return `### ${prop.deprecated ? `~\`${prop.name}\`~` : `\`${prop.name}\``}

${`\`\`\`ts definition
${prop.type}${prop.defaultValue ? ` = ${prop.defaultValue}` : ""}
\`\`\``}${
      prop.deprecated
        ? `\n**Deprecated**${
            typeof prop.deprecated === "string" ? `: ${prop.deprecated}` : ""
          }\n`
        : ""
    }
${prop.description.replace(
  "Live examples:",
  `#### Live examples

<div data-cards>

`
)}
${prop.description.includes("Live examples:") ? "\n</div>" : ""}
${
  prop.examples.length > 0
    ? `
#### Code examples

${prop.examples
  .map((example) =>
    `\`\`\`${example.language}
${example.code}
\`\`\``.trim()
  )
  .join("\n\n")}\n`
    : ""
}
`.trim();
  };

  const content = `# ${name}
${deprecated ? "\n**Deprecated**\n" : ""}

${description}

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

---

${requiredProps.map(renderProp).join("\n\n---\n\n")}\n`
    : ""
}
${
  optionalProps.length > 0
    ? `## Optional Props

---

${optionalProps.map(renderProp).join("\n\n---\n\n")}\n`
    : ""
}
${
  returnProps && returnProps.length > 0
    ? `## Return Props

---

${returnProps.map(renderProp).join("\n\n---\n\n")}\n`
    : ""
}
`;

  return content;
}
