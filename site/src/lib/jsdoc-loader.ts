/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { z } from "astro:content";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { invariant } from "@ariakit/core/utils/misc";
import type { LoaderContext } from "astro/loaders";
import type { FunctionLikeDeclaration } from "ts-morph";
import { Node, Project, ts } from "ts-morph";
import { createLogger } from "./logger.ts";
import type { FrameworkSchema, Reference } from "./schemas.ts";
import { ReferenceSchema } from "./schemas.ts";
import { slugify } from "./string.ts";

export interface JsDocFrameworkOptions {
  /** Framework name */
  framework: z.infer<typeof FrameworkSchema>;
  /**
   * Path to the ariakit core package (e.g., `ariakit-react-core`,
   * `ariakit-solid-core`)
   */
  corePath: string;
  /** Path to the ariakit package (e.g., ariakit-react, ariakit-solid) */
  packagePath: string;
  /** Whether to watch for file changes and reload */
  watch?: boolean;
}

/**
 * Creates a JSDoc loader for multiple ariakit framework packages
 */
export function jsdoc(...frameworkOptions: JsDocFrameworkOptions[]) {
  return {
    name: "jsdoc-loader",
    schema: ReferenceSchema,
    async load(context: LoaderContext) {
      const logger = createLogger(context.logger);

      // Function to reload all references for a given framework
      const loadAllReferences = (options: JsDocFrameworkOptions) => {
        const { info } = logger.start();
        const references = loadReferences({
          packagePath: options.packagePath,
          corePath: options.corePath,
          framework: options.framework,
        });
        for (const data of references) {
          const nameSlug = slugify(data.name);
          const id = `${data.framework}/${data.component}/${nameSlug}`;
          context.store.set({ id, data });
        }
        info(`Loaded ${references.length} references for ${options.framework}`);
      };

      context.store.clear();
      for (const options of frameworkOptions) {
        loadAllReferences(options);
      }

      if (!context.watcher) return;

      // Set up file watching for frameworks that have watch enabled
      const watchedPaths = new Set<string>();

      for (const options of frameworkOptions) {
        if (!options.watch) continue;
        watchedPaths.add(options.packagePath);
        watchedPaths.add(options.corePath);
        context.watcher.add(options.packagePath);
        context.watcher.add(options.corePath);
      }

      if (!watchedPaths.size) return;

      context.watcher.on("all", (_, path) => {
        const options = frameworkOptions.find(({ corePath, packagePath }) =>
          [corePath, packagePath].some((p) => path.includes(p)),
        );
        if (!options) return;
        loadAllReferences(options);
      });
    },
  };
}

/**
 * Creates a ts-morph project for parsing TypeScript files
 */
function createProject() {
  return new Project({
    tsConfigFilePath: resolve(process.cwd(), "../tsconfig.json"),
  });
}

/**
 * Determines the kind of export based on name patterns and type information
 * Returns null for types that should be skipped
 */
function getExportKind(name: string, node: Node) {
  // Skip type declarations entirely
  if (Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node)) {
    return null;
  }
  // Check for store hooks first (before generic type checks)
  if (name.startsWith("use") && name.endsWith("Store")) {
    return "store";
  }
  // Check if it's a component by looking for ComponentOptions or ComponentProps
  // types This must come BEFORE the function check since components can also be
  // functions
  const sourceFile = node.getSourceFile();
  const exportedDecls = sourceFile.getExportedDeclarations();
  const hasComponentOptions =
    exportedDecls.has(`${name}Options`) || exportedDecls.has(`${name}Props`);
  if (hasComponentOptions) {
    return "component";
  }
  // Check if it's a function (including context hooks)
  if (
    name.startsWith("use") ||
    Node.isFunctionLikeDeclaration(node) ||
    getFunctionDeclaration(node)
  ) {
    return "function";
  }
  // Skip everything else (types that don't have Options/Props)
  return null;
}

/**
 * Extracts live examples from description text and returns cleaned description
 */
function extractLiveExamples(text: string) {
  if (!text) return { description: "", liveExamples: [] };
  // First normalize single line breaks to spaces (but preserve double line
  // breaks for paragraphs) This handles cases where live examples span multiple
  // lines with single breaks
  const normalizedText = text.replace(/(?<!\n)\n(?!\n)/g, " ");
  // Look for "Live examples:" section in the normalized text
  const liveExamplesMatch = normalizedText.match(
    /Live examples:\s*((?:\s*-\s*\[.*?\]\(.*?\).*?)+)/i,
  );
  if (!liveExamplesMatch) {
    // Return the original text (not normalized) if no live examples found
    return { description: text.trim(), liveExamples: [] };
  }
  // Extract URLs from markdown links in the live examples section
  const liveExamplesSection = liveExamplesMatch[1];
  if (!liveExamplesSection) {
    return { description: text.trim(), liveExamples: [] };
  }
  const urlMatches = liveExamplesSection.match(/\[.*?\]\((.*?)\)/g) || [];
  const liveExamples = urlMatches
    .map((match) => {
      const urlMatch = match.match(/\[.*?\]\((.*?)\)/);
      return urlMatch?.[1];
    })
    .filter((url): url is string => !!url);
  const cleanedDescription = text.replace(/\s*Live examples:.*$/is, "").trim();

  return { description: cleanedDescription, liveExamples };
}

/**
 * Extracts description from JSDoc comments
 */
function getDescription(node: Node) {
  if (!Node.isJSDocable(node)) return "";
  const jsDocs = node.getJsDocs();
  if (!jsDocs.length) return "";
  // Get description from first JSDoc block
  const firstJsDoc = jsDocs[0];
  const description = firstJsDoc?.getDescription();
  return description ? String(description).trim() : "";
}

/**
 * Extracts description and live examples from JSDoc comments
 */
function getDescriptionAndLiveExamples(node: Node): {
  description: string;
  liveExamples: string[];
} {
  const rawDescription = getDescription(node);
  return extractLiveExamples(rawDescription);
}

/**
 * Extracts JSDoc tags from a node
 */
function getTags(node: Node) {
  if (!Node.isJSDocable(node)) return [];
  const jsDocs = node.getJsDocs();
  if (!jsDocs.length) return [];
  // Collect all tags from all JSDoc blocks
  const allTags: any[] = [];
  for (const jsDoc of jsDocs) {
    const tags = jsDoc.getTags();
    allTags.push(...tags);
  }
  return allTags;
}

/**
 * Checks if a node has @private tag
 */
function isPrivate(node: Node) {
  const tags = getTags(node);
  return tags.some((tag: any) => tag.getTagName() === "private");
}

/**
 * Gets (at)deprecated tag information
 */
function getDeprecated(node: Node) {
  const tags = getTags(node);
  const tag = tags.find((tag: any) => tag.getTagName() === "deprecated");
  if (!tag) return false;
  const comment = tag.getComment();
  return comment ? String(comment) : true;
}

/**
 * Gets (at)default tag value
 */
function getDefaultValue(node: Node) {
  const tags = getTags(node);
  const tag = tags.find((tag: any) => tag.getTagName() === "default");
  const comment = tag?.getComment();
  if (!comment) return;
  return String(comment).trim();
}

/**
 * Extracts (at)example blocks from JSDoc
 */
function getExamples(node: Node) {
  const tags = getTags(node);
  const examples: Reference["examples"] = [];

  for (const tag of tags) {
    if ((tag as any).getTagName() !== "example") continue;
    const rawText = (tag as any).getComment();
    if (!rawText) continue;
    // Ensure it's a string
    const text = String(rawText);
    // Parse example with optional description and code block
    const match = text.match(
      /^(?<description>(.|\n)*)```(?<language>\S+)(?<modifiers>[^\n]*)\n(?<code>(.|\n)+)\n```$/m,
    );
    examples.push({
      description: (match?.groups?.description || "").trim(),
      language: match?.groups?.language || "jsx",
      meta: match?.groups?.modifiers?.trim() || "",
      code: (match?.groups?.code || text).trim(),
    });
  }
  return examples;
}

/**
 * Gets type information from a TypeScript node
 */
function getTypeText(node: Node) {
  return node
    .getType()
    .getText(
      undefined,
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
        ts.TypeFormatFlags.AddUndefined |
        ts.TypeFormatFlags.UseFullyQualifiedType,
    );
}

/**
 * Gets all direct base interface declarations for a given interface declaration
 */
function getBaseInterfaces(iface: Node) {
  const bases: Node[] = [];
  if (!Node.isInterfaceDeclaration(iface)) {
    return bases;
  }
  const extendsList = iface.getExtends();
  for (const ext of extendsList) {
    const type = ext.getType();
    const symbol = type.getSymbol();
    const decls = symbol?.getDeclarations() || [];
    for (const d of decls) {
      if (!Node.isInterfaceDeclaration(d)) continue;
      bases.push(d);
    }
  }
  return bases;
}

/**
 * Finds property declarations for a given prop name across base interfaces
 * of the provided owner interface, in nearest-first order.
 */
function findPropDeclsInBaseHierarchy(owner: Node, propName: string) {
  const results: Node[] = [];
  if (!Node.isInterfaceDeclaration(owner)) {
    return results;
  }
  const visited = new Set<Node>();
  const queue = getBaseInterfaces(owner);
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    if (visited.has(current)) continue;
    visited.add(current);
    const type = current.getType();
    const sym = type.getProperty(propName);
    const decl = sym?.getDeclarations()?.[0];
    if (decl) {
      results.push(decl);
    }
    const bases = getBaseInterfaces(current);
    for (const base of bases) {
      queue.push(base);
    }
  }
  return results;
}

/**
 * Extracts props from a type or interface
 */
function getProps(node: Node) {
  const nodeProps = node.getType().getProperties();
  const props: Reference["params"] = [];

  for (const prop of nodeProps) {
    const decl = prop.getDeclarations().at(0);
    if (!decl) continue;
    // Skip only if all candidates are private later; start from local decl
    const propName = Node.isPropertySignature(decl)
      ? decl.getName() || prop.getEscapedName()
      : prop.getEscapedName();

    // Build candidate declarations with local-first precedence
    const decls = [decl];
    decls.push(...findPropDeclsInBaseHierarchy(node, propName));

    // Description/liveExamples come from the first visible declaration that has a description
    let description = "";
    let liveExamples: string[] = [];
    for (const decl of decls) {
      const res = getDescriptionAndLiveExamples(decl);
      if (!res.description) continue;
      description = res.description;
      liveExamples = res.liveExamples;
    }
    if (!description) continue;

    const primaryDecl = decls[0];
    if (!primaryDecl) continue;
    const type = getTypeText(primaryDecl);

    // Tags merging: treat all tags as a unit. If the local (nearest visible)
    // declaration has any tags, those override all base tags. Otherwise, use
    // the first base declaration that has tags.
    const localHasTags = !!getTags(primaryDecl).length;
    const tagsDecl = localHasTags
      ? primaryDecl
      : decls.slice(1).find((d) => !!getTags(d).length);

    const hasPrivateTag = tagsDecl ? isPrivate(tagsDecl) : false;
    if (hasPrivateTag) continue;

    const deprecated = tagsDecl ? getDeprecated(tagsDecl) : false;
    const defaultValue = tagsDecl ? getDefaultValue(tagsDecl) : undefined;
    const examples = tagsDecl ? getExamples(tagsDecl) : [];

    // Get nested props if this prop is an object type
    const nestedProps = getProps(primaryDecl);
    // Extract only serializable data
    props.push({
      name: prop.getEscapedName(),
      type,
      description,
      optional: prop.isOptional() || type.endsWith(" | undefined"),
      defaultValue,
      deprecated,
      examples,
      liveExamples,
      props: nestedProps.length > 0 ? nestedProps : undefined,
    });
  }

  return props.sort((a, b) => {
    if (a.deprecated && !b.deprecated) return 1;
    if (!a.deprecated && b.deprecated) return -1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Gets the function declaration from a node (for functions and components)
 */
function getFunctionDeclaration(
  node: Node,
): FunctionLikeDeclaration | undefined {
  if (Node.isFunctionLikeDeclaration(node)) return node;
  return node.getFirstDescendant(Node.isFunctionLikeDeclaration);
}

/**
 * Gets parameters from a function declaration
 */
function getFunctionParams(
  fn: FunctionLikeDeclaration,
  includeUndocumented = false,
) {
  const params: Reference["params"] = [];
  const parameters = fn.getParameters();

  for (const param of parameters) {
    const { description, liveExamples } = getDescriptionAndLiveExamples(param);
    // Skip undocumented params only for regular functions, not for
    // stores/components
    if (!description && !includeUndocumented) continue;
    const type = getTypeText(param);
    const deprecated = getDeprecated(param);
    const defaultValue = getDefaultValue(param);
    const examples = getExamples(param);
    const nestedProps = getProps(param);
    // Get the proper parameter name from the identifier
    const nameNode = param.getNameNode();
    const paramName = Node.isIdentifier(nameNode)
      ? nameNode.getText()
      : param.getName();
    params.push({
      name: paramName,
      type,
      description: description || "",
      optional: param.isOptional() || param.hasQuestionToken(),
      defaultValue,
      deprecated,
      examples,
      liveExamples,
      props: nestedProps.length > 0 ? nestedProps : undefined,
    });
  }

  return params;
}

/**
 * Gets state properties for store kinds from XStoreState type
 */
function getStoreState(name: string, node: Node) {
  if (!name.endsWith("Store")) return [];
  const stateTypeName = name
    .replace(/^use/, "")
    .replace(/Store$/, "StoreState");
  const sourceFile = node.getSourceFile();
  const exportedDecls = sourceFile.getExportedDeclarations();
  const stateDecl = exportedDecls.get(stateTypeName)?.at(0);
  if (!stateDecl) return [];
  return getProps(stateDecl);
}

/**
 * Gets return value information for functions and stores
 */
function getReturnValue(
  fn: FunctionLikeDeclaration,
  kind: Reference["kind"],
): Reference["returnValue"] {
  const returnTypeNode = fn.getReturnTypeNode();
  if (!returnTypeNode) return undefined;
  const type = getTypeText(returnTypeNode);
  const props = kind === "store" ? getProps(returnTypeNode) : [];
  return {
    type,
    description: "",
    props: props.length > 0 ? props : undefined,
  };
}

/**
 * Checks if a function has overloads and returns the implementation
 */
function getFinalFunctionImplementation(node: Node) {
  const name = getSymbolName(node);
  const sourceFile = node.getSourceFile();
  const declarations = sourceFile.getExportedDeclarations().get(name) || [];

  // Find function declarations with bodies (implementations)
  const implementations: FunctionLikeDeclaration[] = [];
  for (const decl of declarations) {
    if (Node.isFunctionLikeDeclaration(decl)) {
      // Implementation has a body, overloads don't
      if (Node.isFunctionDeclaration(decl) && decl.getBody()) {
        implementations.push(decl);
      } else if (!Node.isFunctionDeclaration(decl)) {
        implementations.push(decl);
      }
    }
  }

  // Return the last implementation (consolidates all overrides)
  return implementations.at(-1);
}

/**
 * Extracts the symbol name from various node types
 */
function getSymbolName(node: Node): string {
  if (Node.isVariableStatement(node)) {
    const [decl] = node.getDeclarations();
    invariant(decl, "Variable statement must have a declaration");
    return decl.getName();
  }
  return node.getSymbolOrThrow().getName();
}

interface CreateReferenceParams {
  node: Node;
  component: string;
  framework: z.infer<typeof FrameworkSchema>;
  propsNode?: Node;
}

/**
 * Creates a Reference object from a TypeScript node
 */
function createReference({
  node,
  component,
  framework,
  propsNode,
}: CreateReferenceParams): Reference {
  const name = getSymbolName(node);
  // For variable declarations, get the parent statement for JSDoc
  const docNode = Node.isVariableDeclaration(node)
    ? node.getVariableStatementOrThrow()
    : node;
  const kind = getExportKind(name, node);
  // This should never happen as we filter out null kinds before calling
  // createReference
  if (kind === null) {
    throw new Error(`Unexpected null kind for ${name}`);
  }
  // Get function declaration for analysis
  const fn =
    getFinalFunctionImplementation(node) || getFunctionDeclaration(docNode);

  let params: Reference["params"] = [];
  let state: Reference["state"] = [];
  let returnValue: Reference["returnValue"];

  if (kind === "component") {
    // For components, use ComponentNameOptions or ComponentNameProps type for
    // params
    const sourceFile = node.getSourceFile();
    const exportedDecls = sourceFile.getExportedDeclarations();
    const optionsDecl =
      propsNode ||
      exportedDecls.get(`${name}Options`)?.at(0) ||
      exportedDecls.get(`${name}Props`)?.at(0) ||
      fn?.getParameters()?.at(0);

    if (optionsDecl) {
      // For components, the options/props type becomes the first (and usually
      // only) param
      const optionsProps = getProps(optionsDecl);
      const { description: propsDescription, liveExamples: propsLiveExamples } =
        getDescriptionAndLiveExamples(optionsDecl);
      // Always include the props parameter for components, even if no
      // individual props are documented
      params = [
        {
          name: "props",
          type: getTypeText(optionsDecl),
          description: propsDescription || `${name} component props`,
          optional: false,
          defaultValue: undefined,
          deprecated: false,
          examples: [],
          liveExamples: propsLiveExamples,
          props: optionsProps.length > 0 ? optionsProps : undefined,
        },
      ];
    }
  } else if (kind === "function") {
    // For functions, get parameters
    if (fn) {
      params = getFunctionParams(fn);
      returnValue = getReturnValue(fn, kind);
    }
  } else if (kind === "store") {
    // For stores, get params from function parameters (include undocumented
    // params)
    if (fn) {
      params = getFunctionParams(fn, true);
      returnValue = getReturnValue(fn, kind);
    }
    // Get state from XStoreState type
    state = getStoreState(name, node);
  }
  // Extract all data as primitives to ensure serializability
  const { description, liveExamples } = getDescriptionAndLiveExamples(docNode);
  const deprecated = getDeprecated(docNode);
  const examples = getExamples(docNode);
  return {
    name,
    component,
    kind,
    framework,
    description,
    deprecated,
    examples,
    params,
    state,
    returnValue,
    liveExamples,
  };
}

interface GetPublicExportsParams {
  component: string;
  packagePath: string;
}

/**
 * Gets the exported names from an ariakit package module file
 */
function getPublicExports({
  component,
  packagePath,
}: GetPublicExportsParams): Set<string> {
  const publicModulePath = join(packagePath, "src", `${component}.ts`);
  if (!existsSync(publicModulePath)) {
    return new Set();
  }
  const content = readFileSync(publicModulePath, "utf-8");
  const exports = new Set<string>();
  // Match various export patterns
  const patterns = [
    // export { Name } from "path"
    /export\s*{\s*([^}]+)\s*}\s*from/g,
    // export { Name }
    /export\s*{\s*([^}]+)\s*}/g,
    // export const Name = ...
    /export\s+const\s+(\w+)/g,
    // export function Name
    /export\s+function\s+(\w+)/g,
    // export type { Name } from "path"
    /export\s+type\s*{\s*([^}]+)\s*}\s*from/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const exportList = match[1];
      if (!exportList) continue;
      // Handle multiple exports in braces: { Name1, Name2, Name3 }
      const names = exportList.split(",").map(
        // Remove "as alias" parts
        (name) => name.trim().replace(/\s+as\s+\w+/, ""),
      );
      names.forEach((name) => {
        if (name) {
          exports.add(name.trim());
        }
      });
    }
  }
  return exports;
}

interface ParseReExportedReferencesParams {
  project: Project;
  component: string;
  publicExports: Set<string>;
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Parses references from re-exported modules (most components)
 * This handles cases where the public module re-exports from multiple source files
 */
function parseReExportedReferences({
  project,
  component,
  publicExports,
  packagePath,
  corePath,
  framework,
}: ParseReExportedReferencesParams) {
  const publicModulePath = join(packagePath, "src", `${component}.ts`);
  const content = readFileSync(publicModulePath, "utf-8");
  const references: Reference[] = [];
  // Parse all re-export statements to find source files
  const reExportPattern =
    /export\s*(?:type\s*)?\{\s*([^}]+)\s*\}\s*from\s*["']([^"']+)["']/g;
  const directExportPattern =
    /export\s*\{\s*([^}]+)\s*\}\s*from\s*["']([^"']+)["']/g;

  let match: RegExpExecArray | null;

  // Process re-exports with type exports
  while ((match = reExportPattern.exec(content)) !== null) {
    const exportList = match[1];
    const fromPath = match[2];

    if (!exportList || !fromPath) continue;

    const sourceReferences = parseSourceFileExports({
      project,
      component,
      fromPath,
      exportList,
      publicExports,
      corePath,
      framework,
    });
    references.push(...sourceReferences);
  }

  // Reset regex and process direct exports
  content.replace(directExportPattern, (_, exportList, fromPath) => {
    if (!exportList || !fromPath) return "";

    const sourceReferences = parseSourceFileExports({
      project,
      component,
      fromPath,
      exportList,
      publicExports,
      corePath,
      framework,
    });
    references.push(...sourceReferences);
    return "";
  });

  return references.sort((a, b) => {
    const order = { function: 0, store: 1, component: 2 };
    const aOrder = order[a.kind];
    const bOrder = order[b.kind];

    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

interface ParseSourceFileExportsParams {
  project: Project;
  component: string;
  fromPath: string;
  exportList: string;
  publicExports: Set<string>;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Parses exports from a specific source file
 */
function parseSourceFileExports({
  project,
  component,
  fromPath,
  exportList,
  publicExports,
  corePath,
  framework,
}: ParseSourceFileExportsParams) {
  // Resolve the actual file path - handle framework core paths
  const corePackagePrefix = `@ariakit/${framework}-core/`;
  const resolvedPath = join(
    corePath,
    "src",
    fromPath.replace(new RegExp(`^${corePackagePrefix}`), ""),
  );

  if (!existsSync(`${resolvedPath}.ts`) && !existsSync(`${resolvedPath}.tsx`)) {
    return [];
  }

  const finalPath = existsSync(`${resolvedPath}.tsx`)
    ? `${resolvedPath}.tsx`
    : `${resolvedPath}.ts`;

  let sourceFile = project.getSourceFile(finalPath);
  if (!sourceFile) {
    sourceFile = project.addSourceFileAtPath(finalPath);
    project.resolveSourceFileDependencies();
  } else {
    sourceFile.refreshFromFileSystemSync();
  }

  const exportedDecls = sourceFile.getExportedDeclarations();
  const references: Reference[] = [];
  // Prevent duplicate declarations
  const processedNames = new Set<string>();

  // Parse the exported names from the export list
  const names = exportList
    .split(",")
    // Remove "as alias" parts
    .map((name) => name.trim().replace(/\s+as\s+\w+/, ""))
    // Include all exports
    .filter((name) => name);

  for (const name of names) {
    // Only include exports that are re-exported publicly
    if (!publicExports.has(name)) continue;

    // Prevent duplicate declarations
    if (processedNames.has(name)) continue;
    processedNames.add(name);

    const decls = exportedDecls.get(name);
    const decl = decls?.at(0);
    if (!decl) continue;

    // Skip private exports
    if (isPrivate(decl)) continue;

    // Get the kind to determine what to include
    const kind = getExportKind(name, decl);

    // Skip types (when kind is null) - only include functions, components, and
    // stores
    if (kind !== null) {
      const optionsType = exportedDecls.get(`${name}Options`)?.at(0);

      references.push(
        createReference({
          node: decl,
          component,
          framework,
          propsNode: optionsType,
        }),
      );
    }
  }

  return references;
}

interface ParseDirectExportReferencesParams {
  project: Project;
  component: string;
  publicExports: Set<string>;
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Parses references from direct exports (like store.ts)
 */
function parseDirectExportReferences({
  project,
  component,
  publicExports,
  packagePath,
  corePath,
  framework,
}: ParseDirectExportReferencesParams) {
  const publicModulePath = join(packagePath, "src", `${component}.ts`);
  const content = readFileSync(publicModulePath, "utf-8");
  const references: Reference[] = [];

  // Parse the public module file to find where exports come from
  const reExportPattern = /export\s*{\s*([^}]+)\s*}\s*from\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = reExportPattern.exec(content)) !== null) {
    const exportList = match[1];
    const fromPath = match[2];

    if (!exportList || !fromPath) continue;

    const sourceReferences = parseSourceFileExports({
      project,
      component,
      fromPath,
      exportList,
      publicExports,
      corePath,
      framework,
    });
    references.push(...sourceReferences);
  }

  return references.sort((a, b) => {
    const order = { function: 0, store: 1, component: 2 };
    const aOrder = order[a.kind];
    const bOrder = order[b.kind];

    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

interface ParseComponentReferencesParams {
  project: Project;
  component: string;
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Parses references from a single component module
 */
function parseComponentReferences({
  project,
  component,
  packagePath,
  corePath,
  framework,
}: ParseComponentReferencesParams) {
  // Get the list of publicly exported names from the ariakit package module
  const publicExports = getPublicExports({ component, packagePath });
  if (publicExports.size === 0) {
    console.warn(`No public exports found for component: ${component}`);
    return [];
  }
  // Check if this is a direct export module (like store.ts)
  const publicModulePath = join(packagePath, "src", `${component}.ts`);
  const publicContent = readFileSync(publicModulePath, "utf-8");
  // Handle direct exports (e.g., export { useStoreState } from "path")
  if (publicContent.includes('from "')) {
    return parseReExportedReferences({
      project,
      component,
      publicExports,
      packagePath,
      corePath,
      framework,
    });
  }
  // Handle direct function/const exports in the public module
  return parseDirectExportReferences({
    project,
    component,
    publicExports,
    packagePath,
    corePath,
    framework,
  });
}

/**
 * Gets all component module names from ariakit package index.ts
 */
function getComponentModules(packagePath: string) {
  const indexPath = join(packagePath, "src", "index.ts");
  const content = readFileSync(indexPath, "utf-8");
  const modules: string[] = [];
  const exportRegex = /export \* from ["']\.\/(.+?)["'];/g;
  let match: RegExpExecArray | null;

  while ((match = exportRegex.exec(content)) !== null) {
    const moduleName = match[1];
    if (moduleName) {
      modules.push(moduleName.replace(/\.ts$/, ""));
    }
  }

  return modules;
}

interface LoadReferencesParams {
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Main loader function that parses all references
 */
function loadReferences({
  packagePath,
  corePath,
  framework,
}: LoadReferencesParams) {
  const project = createProject();
  const componentModules = getComponentModules(packagePath);
  const allReferences: Reference[] = [];

  for (const component of componentModules) {
    const references = parseComponentReferences({
      project,
      component,
      packagePath,
      corePath,
      framework,
    });
    allReferences.push(...references);
  }

  return allReferences;
}
