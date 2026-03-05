import { writeFileSync } from "node:fs";
import { input } from "./input.ts";
import type {
  AtRule,
  CustomProperty,
  CustomVariant,
  Rule,
  Var,
} from "./lib.ts";
import { Type } from "./lib.ts";

type BlockChild = AtRule["children"][number];
type DeclarationNode = Extract<BlockChild, { type: Type["Declaration"] }>;
type OutputNode = CustomProperty | CustomVariant | BlockChild | Var;
type IdentifierType = Type["Var"] | Type["CustomProperty"];

const INDENT = "  ";

function getIndent(depth: number) {
  return INDENT.repeat(depth);
}

function quotePropertySyntax(syntax: string) {
  const isQuotedWithDouble = syntax.startsWith('"') && syntax.endsWith('"');
  const isQuotedWithSingle = syntax.startsWith("'") && syntax.endsWith("'");
  if (isQuotedWithDouble || isQuotedWithSingle) {
    return syntax;
  }
  return JSON.stringify(syntax);
}

function toCssProperty(property: string) {
  if (property.startsWith("--")) {
    return property;
  }

  const cssProperty = property.replace(/[A-Z]/g, (character) => {
    return `-${character.toLowerCase()}`;
  });

  if (/^ms[A-Z]/.test(property)) {
    return `-${cssProperty}`;
  }

  return cssProperty;
}

function renderDeclaration(declaration: DeclarationNode, depth: number) {
  const indentation = getIndent(depth);
  if (declaration.property.startsWith("@")) {
    if (declaration.value == null || declaration.value === "") {
      return `${indentation}${declaration.property};`;
    }
    return `${indentation}${declaration.property} ${declaration.value};`;
  }
  if (declaration.value == null) {
    throw new Error(
      `Cannot render declaration "${declaration.property}" without a value.`,
    );
  }
  const property = toCssProperty(declaration.property);
  return `${indentation}${property}: ${declaration.value};`;
}

function renderBlock(
  header: string,
  children: BlockChild[],
  depth: number,
): string {
  const indentation = getIndent(depth);
  if (!children.length) {
    return `${indentation}${header} {}`;
  }
  const renderedChildren = children
    .map((child) => renderBlockChild(child, depth + 1))
    .join("\n");
  return `${indentation}${header} {\n${renderedChildren}\n${indentation}}`;
}

function renderCustomProperty(property: CustomProperty, depth: number) {
  const indentation = getIndent(depth);
  const nextIndentation = getIndent(depth + 1);
  const lines = [
    `${indentation}@property ${property.ident} {`,
    `${nextIndentation}syntax: ${quotePropertySyntax(property.syntax)};`,
    `${nextIndentation}inherits: ${property.inherits};`,
  ];
  if (property.initial != null) {
    lines.push(`${nextIndentation}initial-value: ${property.initial};`);
  }
  lines.push(`${indentation}}`);
  return lines.join("\n");
}

function renderAtRule(rule: AtRule, depth: number) {
  const params = rule.params ? ` ${rule.params}` : "";
  const atRuleHeader = `@${rule.name}${params}`;
  if (!rule.children.length) {
    return `${getIndent(depth)}${atRuleHeader};`;
  }
  return renderBlock(atRuleHeader, rule.children, depth);
}

function renderRule(rule: Rule, depth: number) {
  return renderBlock(rule.selector, rule.children, depth);
}

function renderCustomVariant(variant: CustomVariant, depth: number) {
  return renderBlock(
    `@${variant.type} ${variant.name}`,
    variant.children,
    depth,
  );
}

function renderVar(_variable: Var): string {
  // Vars are references used inside values, not standalone CSS statements.
  return "";
}

function renderBlockChild(child: BlockChild, depth: number) {
  switch (child.type) {
    case Type.Declaration:
      return renderDeclaration(child, depth);
    case Type.CustomProperty:
      return renderCustomProperty(child, depth);
    case Type.Rule:
      return renderRule(child, depth);
    case Type.AtRule:
      return renderAtRule(child, depth);
    default:
      return assertNever(child);
  }
}

function renderNode(node: OutputNode, depth: number): string {
  switch (node.type) {
    case Type.Var:
      return renderVar(node);
    case Type.CustomProperty:
      return renderCustomProperty(node, depth);
    case Type.CustomVariant:
      return renderCustomVariant(node, depth);
    case Type.Declaration:
    case Type.Rule:
    case Type.AtRule:
      return renderBlockChild(node, depth);
    default:
      return assertNever(node);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported node type: ${JSON.stringify(value)}`);
}

function collectIdentifierTypes(nodes: OutputNode[]) {
  const identifierTypes = new Map<string, IdentifierType[]>();

  const addIdentifierType = (ident: string, type: IdentifierType) => {
    const existingTypes = identifierTypes.get(ident);
    if (existingTypes) {
      existingTypes.push(type);
      return;
    }
    identifierTypes.set(ident, [type]);
  };

  const visitBlockChild = (child: BlockChild) => {
    switch (child.type) {
      case Type.CustomProperty:
        addIdentifierType(child.ident, child.type);
        return;
      case Type.Rule:
      case Type.AtRule:
        for (const nestedChild of child.children) {
          visitBlockChild(nestedChild);
        }
        return;
      case Type.Declaration:
        return;
      default:
        return assertNever(child);
    }
  };

  const visitNode = (node: OutputNode) => {
    switch (node.type) {
      case Type.Var:
      case Type.CustomProperty:
        addIdentifierType(node.ident, node.type);
        return;
      case Type.CustomVariant:
        for (const child of node.children) {
          visitBlockChild(child);
        }
        return;
      case Type.Declaration:
      case Type.Rule:
      case Type.AtRule:
        visitBlockChild(node);
        return;
      default:
        return assertNever(node);
    }
  };

  for (const node of nodes) {
    visitNode(node);
  }

  return identifierTypes;
}

function assertUniqueIdentifiers(nodes: OutputNode[]) {
  const identifierTypes = collectIdentifierTypes(nodes);
  const duplicates: string[] = [];

  for (const [ident, types] of identifierTypes) {
    if (types.length < 2) continue;

    const typeCounts = new Map<IdentifierType, number>();
    for (const type of types) {
      const count = typeCounts.get(type) ?? 0;
      typeCounts.set(type, count + 1);
    }

    const summary = Array.from(typeCounts.entries())
      .map(([type, count]) => `${type}: ${count}`)
      .join(", ");
    duplicates.push(`${ident} (${summary})`);
  }

  if (!duplicates.length) {
    return;
  }

  const formattedDuplicates = duplicates.sort().map((duplicate) => {
    return `- ${duplicate}`;
  });
  throw new Error(
    [
      "Duplicate identifiers found across props and vars:",
      ...formattedDuplicates,
    ].join("\n"),
  );
}

export function output(nodes: OutputNode[] = input) {
  assertUniqueIdentifiers(nodes);
  const css = nodes
    .map((node) => renderNode(node, 0))
    .filter((value) => value.length > 0)
    .join("\n\n")
    .trim();
  return `${css}\n`;
}

export function build() {
  const css = output();
  writeFileSync(new URL("./output.css", import.meta.url), css);
}

build();
console.log("Generated output.css");
