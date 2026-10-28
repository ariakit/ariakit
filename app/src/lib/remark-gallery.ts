/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { dirname } from "node:path";
import { isObject } from "@ariakit/utils";
import type { ResolvedPreviewRoot } from "./preview-discovery.ts";
import {
  getPreviewIdFromDir,
  resolvePreviewModuleFile,
} from "./preview-discovery.ts";

interface MdxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

interface MdxNode {
  type: string;
  name?: string | null;
  attributes?: MdxAttribute[];
  children?: MdxNode[];
  data?: { estree?: unknown };
}

interface GalleryFile {
  path?: string;
  data: { astro?: { frontmatter?: Record<string, unknown> } };
}

export interface RemarkGalleryExamplesOptions {
  roots: ResolvedPreviewRoot[];
  /** The directory that the `#app/*` imports point to. */
  srcDir: string;
}

// Returns the statements of the ESM or expression that MDX parsed.
function getStatements(node: { data?: { estree?: unknown } }) {
  const program = node.data?.estree;
  if (!isObject(program)) return [];
  if (!Array.isArray(program.body)) return [];
  return program.body.filter(isObject);
}

// Maps the local names of the imports in the gallery to their modules, such as
// `s1` to `./shortcuts/preview.astro`.
function getImports(nodes: MdxNode[]) {
  const imports = new Map<string, string>();
  for (const node of nodes) {
    if (node.type !== "mdxjsEsm") continue;
    for (const statement of getStatements(node)) {
      if (statement.type !== "ImportDeclaration") continue;
      if (!isObject(statement.source)) continue;
      const module = statement.source.value;
      if (typeof module !== "string") continue;
      if (!Array.isArray(statement.specifiers)) continue;
      for (const specifier of statement.specifiers) {
        if (!isObject(specifier)) continue;
        if (!isObject(specifier.local)) continue;
        const { name } = specifier.local;
        if (typeof name !== "string") continue;
        imports.set(name, module);
      }
    }
  }
  return imports;
}

// Returns the identifier in the `source` expression of a card, such as `s1`.
function getSourceName(attribute: MdxAttribute) {
  if (!isObject(attribute.value)) return;
  const [statement] = getStatements(attribute.value);
  const expression = statement?.expression;
  if (!isObject(expression)) return;
  if (expression.type !== "Identifier") return;
  if (typeof expression.name !== "string") return;
  return expression.name;
}

/**
 * Lists the preview ids of the cards in each `gallery.mdx` file, in page order,
 * as the `examples` field of its remark plugin frontmatter, and gives each card
 * a `gallery` prop. The page can then list the examples in the table of
 * contents before the gallery renders.
 *
 * A card source resolves like the `?source` modules do: to the preview id of
 * the folder of the imported module, or to the route of a Next.js page.
 */
export function remarkGalleryExamples({
  roots,
  srcDir,
}: RemarkGalleryExamplesOptions) {
  return (tree: MdxNode, file: GalleryFile) => {
    const filePath = file.path;
    if (!filePath?.endsWith("/gallery.mdx")) return;
    const imports = getImports(tree.children ?? []);

    const getPreviewId = (name: string) => {
      const module = imports.get(name);
      if (!module) return;
      const nextjsPage = module.match(/^nextjs\/pages\/([^?]+)/)?.[1];
      if (nextjsPage) return nextjsPage;
      const moduleFile = resolvePreviewModuleFile(module, filePath, srcDir);
      if (!moduleFile) return;
      return getPreviewIdFromDir(roots, dirname(moduleFile));
    };

    const examples: string[] = [];
    const visit = (node: MdxNode) => {
      if (node.type === "mdxJsxFlowElement" && node.name === "PreviewCard") {
        const attributes = node.attributes ?? [];
        const source = attributes.find((attribute) => {
          return attribute.name === "source";
        });
        const name = source && getSourceName(source);
        if (!name) {
          throw new Error(
            `A gallery card needs a source import in ${filePath}`,
          );
        }
        const previewId = getPreviewId(name);
        if (!previewId) {
          throw new Error(`Cannot find the preview of ${name} in ${filePath}`);
        }
        examples.push(previewId);
        attributes.push({
          type: "mdxJsxAttribute",
          name: "gallery",
          value: null,
        });
      }
      for (const child of node.children ?? []) {
        visit(child);
      }
    };
    visit(tree);

    file.data.astro ??= {};
    file.data.astro.frontmatter = { ...file.data.astro.frontmatter, examples };
  };
}
