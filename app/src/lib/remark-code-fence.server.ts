/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { highlight } from "@ariakit/ui/utils/highlight.server";
import { isObject } from "@ariakit/utils";
import type {
  CodeFenceFile,
  CodeFenceProps,
} from "#app/components/code-fence.react.tsx";
import { getFileIcon } from "../recipes/code-block/file-icons.ts";
import type { CodeFenceOptions } from "./code-fence.ts";
import {
  getCodeLabel,
  getInstallCommands,
  parseCodeFence,
} from "./code-fence.ts";

interface MdastNode {
  type: string;
  children?: MdastNode[];
  lang?: string | null;
  meta?: string | null;
  value?: string;
  position?: { start: { line: number } };
  name?: string;
  attributes?: object[];
  data?: { estree?: unknown };
}

interface FenceFile {
  path?: string;
}

export interface RemarkCodeFencesOptions {
  /**
   * Returns true for the MDX files whose content renders as direct children of
   * the main body of a shell, such as the content of a recipe page. In these
   * files, each run of top-level text goes in a `Prose`, and each top-level
   * fence goes in a `ShellPopout`, so the code is wider than the text.
   */
  isBodyContent?: (filePath: string) => boolean;
  /**
   * The MDX components that go in a `ShellFeature` of their own at the top
   * level of body content, wider than the popout of a fence. Another plugin can
   * render a fence in one of these, such as the example card of a preview
   * fence. A pattern matches the names of components that a page imports, such
   * as its figures.
   */
  features?: (string | RegExp)[];
}

interface ParsedFence {
  node: MdastNode;
  code: string;
  options: CodeFenceOptions;
}

const componentModule = "#app/components/code-fence.react.tsx";
const proseModule = "@ariakit/ui/components/prose.ariakit.react";
const shellModule = "@ariakit/ui/components/shell.ariakit.react";

// The local names that the plugin imports its components as.
interface ComponentNames {
  fence: string;
  prose: string;
  popout: string;
  feature: string;
}

// Adds the names that a binding pattern declares, such as `{ a, b: [c] }`.
function addPatternNames(pattern: unknown, names: Set<string>) {
  if (!isObject(pattern)) return;
  if (pattern.type === "Identifier") {
    if (typeof pattern.name !== "string") return;
    names.add(pattern.name);
    return;
  }
  if (pattern.type === "AssignmentPattern") {
    addPatternNames(pattern.left, names);
    return;
  }
  if (pattern.type === "RestElement") {
    addPatternNames(pattern.argument, names);
    return;
  }
  if (pattern.type === "ArrayPattern" && Array.isArray(pattern.elements)) {
    for (const element of pattern.elements) {
      addPatternNames(element, names);
    }
    return;
  }
  if (pattern.type !== "ObjectPattern") return;
  if (!Array.isArray(pattern.properties)) return;
  for (const property of pattern.properties) {
    if (!isObject(property)) continue;
    // A rest property is the pattern itself, and other properties hold theirs
    // in the value, such as `b` in `{ a: b }`.
    addPatternNames(
      property.type === "RestElement" ? property : property.value,
      names,
    );
  }
}

// Adds the names of an ESM declaration, such as the locals of an import or the
// bindings of an exported variable, function, or class.
function addDeclaredNames(statement: unknown, names: Set<string>) {
  if (!isObject(statement)) return;
  if (statement.type === "ImportDeclaration") {
    if (!Array.isArray(statement.specifiers)) return;
    for (const specifier of statement.specifiers) {
      if (!isObject(specifier)) continue;
      addPatternNames(specifier.local, names);
    }
    return;
  }
  if (statement.type !== "ExportNamedDeclaration") return;
  const { declaration } = statement;
  if (!isObject(declaration)) return;
  const declarators = Array.isArray(declaration.declarations)
    ? declaration.declarations
    : [declaration];
  for (const declarator of declarators) {
    if (!isObject(declarator)) continue;
    addPatternNames(declarator.id, names);
  }
}

// Picks local names that the imports and exports of the file don't declare, so
// the generated imports can't declare a binding twice.
function getComponentNames(tree: MdastNode): ComponentNames {
  const declared = new Set<string>();
  for (const node of tree.children ?? []) {
    if (node.type !== "mdxjsEsm") continue;
    const program = node.data?.estree;
    if (!isObject(program)) continue;
    if (!Array.isArray(program.body)) continue;
    for (const statement of program.body) {
      addDeclaredNames(statement, declared);
    }
  }
  const getName = (base: string) => {
    let name = base;
    for (let suffix = 2; declared.has(name); suffix++) {
      name = `${base}${suffix}`;
    }
    return name;
  };
  return {
    fence: getName("CodeFence"),
    prose: getName("CodeFenceProse"),
    popout: getName("CodeFencePopout"),
    feature: getName("CodeFenceFeature"),
  };
}

// The estree that MDX needs for `import { Name as Local } from "…"`. Astro
// finds the module of an island in this tree, so the import can't be a string
// alone.
function createImport(name: string, local: string, module: string) {
  const specifier = name === local ? name : `${name} as ${local}`;
  return {
    type: "mdxjsEsm",
    value: `import { ${specifier} } from "${module}";`,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ImportDeclaration",
            specifiers: [
              {
                type: "ImportSpecifier",
                imported: { type: "Identifier", name },
                local: { type: "Identifier", name: local },
              },
            ],
            source: { type: "Literal", value: module },
            attributes: [],
          },
        ],
      },
    },
  };
}

function createWrapper(
  name: string,
  className: string,
  children: MdastNode[],
): MdastNode {
  const attributes = className ? [createAttribute("className", className)] : [];
  return { type: "mdxJsxFlowElement", name, attributes, children };
}

// Nodes that MDX reads at the top level of the file, outside the content.
function isModuleNode(node: MdastNode) {
  return node.type === "mdxjsEsm" || node.type === "yaml";
}

// Puts each run of text in a Prose in the content column, each fence in a
// ShellPopout, like the Code Blocks in Prose example, and each feature in a
// ShellFeature. A band around them spaces them with the gap of a Prose, so the
// text keeps the rhythm of one Prose column. It is the first of the two band
// levels that a shell allows, and it spans the widest part, because the parts
// can only use the column lines inside it.
function splitBodyContent(
  tree: MdastNode,
  fences: Set<MdastNode>,
  isFeature: (node: MdastNode) => boolean,
  names: ComponentNames,
) {
  let hasPopout = false;
  let hasFeature = false;
  const moduleNodes: MdastNode[] = [];
  const parts: MdastNode[] = [];
  let run: MdastNode[] = [];
  const flush = () => {
    if (!run.length) return;
    parts.push(
      createWrapper(names.prose, "[.shell-band>&]:col-[content]", run),
    );
    run = [];
  };
  for (const child of tree.children ?? []) {
    if (isModuleNode(child)) {
      moduleNodes.push(child);
    } else if (fences.has(child)) {
      flush();
      hasPopout = true;
      parts.push(createWrapper(names.popout, "", [child]));
    } else if (isFeature(child)) {
      flush();
      hasFeature = true;
      parts.push(createWrapper(names.feature, "", [child]));
    } else {
      run.push(child);
    }
  }
  flush();
  const band = hasFeature ? names.feature : names.popout;
  const body = createWrapper(band, "ui-spacing-em gap-y-5", parts);
  tree.children = [...moduleNodes, body];
  tree.children.unshift(createImport("Prose", names.prose, proseModule));
  // Each band is imported only when the content uses it, as a part or around
  // the parts.
  if (hasPopout || !hasFeature) {
    tree.children.unshift(
      createImport("ShellPopout", names.popout, shellModule),
    );
  }
  if (hasFeature) {
    tree.children.unshift(
      createImport("ShellFeature", names.feature, shellModule),
    );
  }
}

// Converts JSON data into an estree expression. Object properties with
// undefined values are left out, as JSON.stringify does.
function toEstree(value: unknown): object {
  if (Array.isArray(value)) {
    return { type: "ArrayExpression", elements: value.map(toEstree) };
  }
  if (value !== null && typeof value === "object") {
    const properties = Object.entries(value).flatMap(([key, item]) => {
      if (item === undefined) return [];
      return {
        type: "Property",
        key: { type: "Literal", value: key },
        value: toEstree(item),
        kind: "init",
        method: false,
        shorthand: false,
        computed: false,
      };
    });
    return { type: "ObjectExpression", properties };
  }
  return { type: "Literal", value };
}

function createAttribute(name: string, value: unknown) {
  if (typeof value === "string") {
    return { type: "mdxJsxAttribute", name, value };
  }
  const expression = toEstree(value);
  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: JSON.stringify(value),
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [{ type: "ExpressionStatement", expression }],
        },
      },
    },
  };
}

// The code fence hydrates when it scrolls into view, so its copy button, tabs,
// and expand button work. A page can have dozens of blocks, and most of them
// start out of view.
function createElement(props: CodeFenceProps, name: string): MdastNode {
  const attributes = Object.entries(props).flatMap(([name, value]) => {
    if (value === undefined) return [];
    return createAttribute(name, value);
  });
  return {
    type: "mdxJsxFlowElement",
    name,
    attributes: [
      { type: "mdxJsxAttribute", name: "client:visible", value: null },
      ...attributes,
    ],
    children: [],
  };
}

function createFile({ code, options }: ParsedFence): CodeFenceFile {
  const { title, language, lines, words } = options;
  const { html, text } = highlight(code, language, { lines, words });
  // The scroll area of the code is a tab stop that needs a name, which the
  // title gives. Wrapped code doesn't scroll, so it isn't one.
  const needsLabel = !title && !options.wrap;
  return {
    title,
    icon: title ? getFileIcon(title) : undefined,
    label: needsLabel ? getCodeLabel(language) : undefined,
    html,
    text,
    lineNumbers: options.lineNumbers || undefined,
    wrap: options.wrap || undefined,
    prompt: options.prompt || undefined,
  };
}

function createInstallProps(code: string): CodeFenceProps {
  const commands = getInstallCommands(code) ?? [];
  return {
    kind: "install",
    commands: commands.map(({ packageManager, command }) => ({
      packageManager,
      icon: getFileIcon(packageManager),
      ...highlight(command, "bash"),
    })),
  };
}

/**
 * Renders each fenced code block of an MDX file as an Ariakit UI code block.
 * The info string sets its options, as `parseCodeFence` reads them. Adjacent
 * fences with the `tab` flag join one block with a tab for each fence, and a
 * fence with the `install` flag gets a tab for each package manager. Any
 * mistake in an info string stops the build with its file and line.
 *
 * ````md
 * ```counter.tsx {1} "count" lineNumbers
 * const [count, setCount] = useState(0);
 * ```
 * ````
 */
export function remarkCodeFences({
  isBodyContent,
  features = [],
}: RemarkCodeFencesOptions = {}) {
  return (tree: MdastNode, file: FenceFile) => {
    // Plain Markdown has no components, so only MDX files get the blocks.
    const filePath = file.path;
    if (!filePath?.endsWith(".mdx")) return;
    const errors: string[] = [];
    const fences = new Set<MdastNode>();
    const names = getComponentNames(tree);

    const report = (node: MdastNode, messages: string[]) => {
      const line = node.position?.start.line ?? 0;
      for (const message of messages) {
        errors.push(`${filePath}:${line}: ${message}`);
      }
    };

    // A fence can be read while looking for the end of a tab group and again as
    // its own block, so each one is parsed and reported once.
    const parsed = new Map<MdastNode, ParsedFence | undefined>();
    const parse = (node: MdastNode) => {
      if (parsed.has(node)) return parsed.get(node);
      const code = node.value ?? "";
      const result = parseCodeFence({ lang: node.lang, meta: node.meta, code });
      const fence = result.errors.length
        ? undefined
        : { node, code, options: result.options };
      report(node, result.errors);
      parsed.set(node, fence);
      return fence;
    };

    const createTabsProps = (group: ParsedFence[], first: MdastNode) => {
      const titles = new Set<string>();
      const maxLines = new Set<number>();
      for (const { node, options } of group) {
        if (options.maxLines != null) {
          maxLines.add(options.maxLines);
        }
        if (!options.title) continue;
        if (titles.has(options.title)) {
          report(node, [
            `The tab group has two ${options.title} tabs. Write text between the fences to start a new group, or rename one.`,
          ]);
        }
        titles.add(options.title);
      }
      if (maxLines.size > 1) {
        report(first, [
          "The tabs of a group set different maxLines. The block has one, so set it on one fence or give each the same value.",
        ]);
      }
      const props: CodeFenceProps = {
        kind: "tabs",
        files: group.map(createFile),
        maxLines: [...maxLines][0],
      };
      return props;
    };

    // Returns the props of the fence at `index` and the number of nodes it
    // replaces, which is more than one for a tab group.
    const transform = (children: MdastNode[], index: number) => {
      const node = children[index];
      if (!node) return;
      const fence = parse(node);
      if (!fence) return;
      if (fence.options.install) {
        return { props: createInstallProps(fence.code), count: 1 };
      }
      if (!fence.options.tab) {
        const { maxLines } = fence.options;
        const props: CodeFenceProps = {
          kind: "code",
          file: createFile(fence),
          maxLines,
        };
        return { props, count: 1 };
      }
      // A group ends at the first node that isn't a tab fence.
      const group = [fence];
      for (let next = index + 1; next < children.length; next++) {
        const sibling = children[next];
        if (sibling?.type !== "code") break;
        const tab = parse(sibling);
        if (!tab?.options.tab) break;
        group.push(tab);
      }
      return { props: createTabsProps(group, node), count: group.length };
    };

    const visit = (parent: MdastNode) => {
      const { children } = parent;
      if (!children) return;
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        if (!child) continue;
        if (child.type !== "code") {
          visit(child);
          continue;
        }
        const result = transform(children, index);
        if (!result) continue;
        const element = createElement(result.props, names.fence);
        fences.add(element);
        children.splice(index, result.count, element);
      }
    };
    visit(tree);

    if (errors.length) {
      throw new Error(`Fix these code fences:\n${errors.join("\n")}`);
    }
    if (isBodyContent?.(filePath)) {
      const isFeature = (node: MdastNode) => {
        if (node.type !== "mdxJsxFlowElement") return false;
        const { name } = node;
        if (!name) return false;
        return features.some((feature) => {
          if (typeof feature === "string") return feature === name;
          return feature.test(name);
        });
      };
      splitBodyContent(tree, fences, isFeature, names);
    }
    if (!fences.size) return;
    tree.children?.unshift(
      createImport("CodeFence", names.fence, componentModule),
    );
  };
}
