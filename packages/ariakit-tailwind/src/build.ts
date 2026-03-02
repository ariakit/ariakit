import { writeFileSync } from "node:fs";
import { input } from "./input.ts";
import type {
  AtRule,
  CustomProperty,
  CustomVariant,
  Rule,
  Var,
} from "./utils2.ts";
import { Type } from "./utils2.ts";

type BlockChild = AtRule["children"][number];
type DeclarationNode = Extract<BlockChild, { type: Type["Declaration"] }>;
type OutputNode = CustomProperty | CustomVariant | BlockChild | Var;

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
  if (property.initialValue != null) {
    lines.push(`${nextIndentation}initial-value: ${property.initialValue};`);
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

export function output(nodes: OutputNode[] = input) {
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
