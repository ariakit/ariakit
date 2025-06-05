import type { RehypePlugin } from "@astrojs/markdown-remark";
import type { Element } from "hast";
import { visit } from "unist-util-visit";

export const rehypeCodeMeta: RehypePlugin = () => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre") {
        const codeElement = node.children?.find(
          (child): child is Element =>
            child.type === "element" && child.tagName === "code",
        );

        if (!codeElement) return;

        // Look for data-meta attribute on the pre element (added by markdown parser)
        const meta = node.properties?.["data-meta"];
        if (typeof meta !== "string") return;

        // Parse the meta string to extract attributes
        const metaAttributes = parseMetaString(meta);

        // Add parsed attributes to the code element
        if (!codeElement.properties) {
          codeElement.properties = {};
        }

        // Add line numbers
        if (metaAttributes.lineNumbers) {
          codeElement.properties["data-line-numbers"] = true;
        }

        // Add highlight lines
        if (metaAttributes.highlightLines.length > 0) {
          codeElement.properties["data-highlight"] =
            metaAttributes.highlightLines.join(",");
        }

        // Add any other custom attributes
        for (const [key, value] of Object.entries(metaAttributes.other)) {
          codeElement.properties[`data-${key}`] = value;
        }
      }
    });
  };
};

function parseMetaString(meta: string) {
  const result = {
    lineNumbers: false,
    highlightLines: [] as number[],
    other: {} as Record<string, string | boolean>,
  };

  // Parse lineNumbers
  if (meta.includes("lineNumbers")) {
    result.lineNumbers = true;
  }

  // Parse highlight lines - matches patterns like {1-3}, {1,3,5}, {1-3,5-7}
  const highlightMatch = meta.match(/\{([^}]+)\}/);
  if (highlightMatch?.[1]) {
    const ranges = highlightMatch[1].split(",");
    for (const range of ranges) {
      const trimmedRange = range.trim();
      if (trimmedRange.includes("-")) {
        const parts = trimmedRange.split("-");
        const start = Number(parts[0]);
        const end = Number(parts[1]);
        if (!Number.isNaN(start) && !Number.isNaN(end)) {
          for (let i = start; i <= end; i++) {
            result.highlightLines.push(i);
          }
        }
      } else {
        const num = Number(trimmedRange);
        if (!Number.isNaN(num)) {
          result.highlightLines.push(num);
        }
      }
    }
  }

  // Parse other key=value pairs
  const keyValueRegex = /(\w+)=([^\s]+)/g;
  let match: RegExpExecArray | null;
  while ((match = keyValueRegex.exec(meta)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key && value) {
      result.other[key] =
        value === "true" ? true : value === "false" ? false : value;
    }
  }

  return result;
}
