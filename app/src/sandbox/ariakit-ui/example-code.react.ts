/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import * as badge from "@ariakit/ui/components/badge.ariakit.react";
import * as button from "@ariakit/ui/components/button.ariakit.react";
import * as checkbox from "@ariakit/ui/components/checkbox.ariakit.react";
import * as code from "@ariakit/ui/components/code.ariakit.react";
import * as combobox from "@ariakit/ui/components/combobox.ariakit.react";
import * as dialog from "@ariakit/ui/components/dialog.ariakit.react";
import * as disclosure from "@ariakit/ui/components/disclosure.ariakit.react";
import * as frame from "@ariakit/ui/components/frame.ariakit.react";
import * as heading from "@ariakit/ui/components/heading.ariakit.react";
import * as input from "@ariakit/ui/components/input.ariakit.react";
import * as kbd from "@ariakit/ui/components/kbd.ariakit.react";
import * as layer from "@ariakit/ui/components/layer.ariakit.react";
import * as link from "@ariakit/ui/components/link.ariakit.react";
import * as list from "@ariakit/ui/components/list.ariakit.react";
import * as nav from "@ariakit/ui/components/nav.ariakit.react";
import * as option from "@ariakit/ui/components/option.ariakit.react";
import * as popover from "@ariakit/ui/components/popover.ariakit.react";
import * as progress from "@ariakit/ui/components/progress.ariakit.react";
import * as prose from "@ariakit/ui/components/prose.ariakit.react";
import * as radio from "@ariakit/ui/components/radio.ariakit.react";
import * as separator from "@ariakit/ui/components/separator.ariakit.react";
import * as table from "@ariakit/ui/components/table.ariakit.react";
import * as tabs from "@ariakit/ui/components/tabs.ariakit.react";
import * as text from "@ariakit/ui/components/text.ariakit.react";
import * as tooltip from "@ariakit/ui/components/tooltip.ariakit.react";
import { isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

// Every `@ariakit/ui` component module, in a fixed order. The registry below
// maps the exported values to their export names, which is the only way to name
// a component that survives minification: the client bundle is minified and the
// server bundle is not, so `Function.name` would print different code in the
// two renders and React would report a hydration mismatch.
const componentModules = [
  badge,
  button,
  checkbox,
  code,
  combobox,
  dialog,
  disclosure,
  frame,
  heading,
  input,
  kbd,
  layer,
  link,
  list,
  nav,
  option,
  popover,
  progress,
  prose,
  radio,
  separator,
  table,
  tabs,
  text,
  tooltip,
];

// Props that describe the rendered state rather than the styling. They are
// printed because a reader cannot tell a checked card from an unchecked one
// from the component name alone.
const STATE_PROPS = [
  "disabled",
  "checked",
  "defaultChecked",
  "open",
  "defaultOpen",
  "selected",
];

// Plain props that choose a rendering the way a `$` variant does, such as an
// ordered list, a sortable column or a disclosure indicator. Without them,
// boxes that differ only by one of these would print the same snippet. Plumbing
// props that only pin an overlay for the page (portal, flip, slide, gutter)
// must stay out of this list.
const SEMANTIC_PROPS = [
  "accessibleWhenDisabled",
  "badge",
  "checkmark",
  "chevron",
  "description",
  "dir",
  "fallback",
  "glider",
  "group",
  "guide",
  "header",
  "indicator",
  "items",
  "level",
  "list",
  "numeric",
  "ordered",
  "placement",
  "progress",
  "prose",
  "rows",
  "selectOnMove",
  "single",
  "sort",
  "split",
  "tabs",
  "type",
  "value",
];

// Text longer than this is copy rather than a component label, so it prints as
// an ellipsis. The snippet is about which components and variants an example
// uses, not about its content.
const MAX_TEXT_LENGTH = 24;

const INDENT = "  ";

function createComponentNames() {
  const names = new Map<unknown, string>();
  const register = (value: unknown, name: string) => {
    if (!value) return;
    if (typeof value !== "function" && typeof value !== "object") return;
    // The first registration wins, so a component re-exported by two modules
    // keeps one stable name.
    if (names.has(value)) return;
    names.set(value, name);
  };
  for (const module of componentModules) {
    for (const [key, value] of Object.entries(module)) {
      register(value, key);
    }
  }
  for (const [key, value] of Object.entries(ak)) {
    register(value, `ak.${key}`);
  }
  return names;
}

const componentNames = createComponentNames();

function getDisplayName(type: unknown) {
  if (!type) return;
  if (typeof type !== "function" && typeof type !== "object") return;
  const { displayName } = type as { displayName?: unknown };
  if (typeof displayName !== "string") return;
  if (!displayName) return;
  return displayName;
}

/** The name a component prints under, or `undefined` when it has none. */
function getComponentName(type: unknown) {
  return componentNames.get(type) ?? getDisplayName(type);
}

interface TransparentComponent {
  exampleCodeTransparent?: boolean;
}

/**
 * Marks a sandbox layout helper as transparent to the serializer, the way a
 * host element is, so the helper's own wrapper stays out of the snippet and
 * only what an example puts inside it prints.
 */
export function markExampleCodeTransparent<Component extends object>(
  component: Component,
) {
  return Object.assign(component, { exampleCodeTransparent: true });
}

/**
 * Host elements, `Fragment` and the other React built-ins are layout, not
 * components, so only their children print. This is what keeps the grid and
 * spacing wrappers an example needs out of its snippet.
 */
function isTransparentType(type: unknown) {
  if (typeof type === "string") return true;
  // Fragment, Suspense, StrictMode and Profiler are all symbols.
  if (typeof type === "symbol") return true;
  if (!type) return false;
  if (typeof type !== "function" && typeof type !== "object") return false;
  // Narrow read of an opt-in flag the sandbox sets on its own helpers.
  return (type as TransparentComponent).exampleCodeTransparent === true;
}

function describeUnknownType(type: unknown) {
  const displayName = getDisplayName(type);
  if (displayName) return displayName;
  if (typeof type === "function" && type.name) return type.name;
  return String(type);
}

function throwUnknownType(type: unknown): never {
  throw new Error(
    `Pass the code prop to <Example> to describe <${describeUnknownType(type)}>`,
  );
}

function getText(node: ReactNode) {
  if (typeof node !== "string" && typeof node !== "number") return;
  const collapsed = String(node).replace(/\s+/g, " ").trim();
  if (!collapsed) return;
  if (collapsed.length > MAX_TEXT_LENGTH) return "…";
  return collapsed;
}

function isPrintedKey(key: string) {
  if (key.startsWith("$")) return true;
  if (STATE_PROPS.includes(key)) return true;
  return SEMANTIC_PROPS.includes(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function formatString(value: string) {
  // A `$` variant or a semantic value is a short token. A longer string is
  // copy, such as a description, and prints as an ellipsis like long text
  // children.
  if (value.length > MAX_TEXT_LENGTH) return JSON.stringify("…");
  return JSON.stringify(value);
}

/**
 * Prints the value of a printed prop as JSX would write it inside braces, or
 * returns `undefined` when the value has nothing a reader can use.
 */
function formatValue(value: unknown): string | undefined {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "string") return formatString(value);
  if (isValidElement(value)) return printInlineElement(value);
  // Data arrays such as rows, items or tabs are content, but passing one picks
  // the declarative form of a component, so the reader still sees the prop.
  if (Array.isArray(value)) return "[…]";
  if (isPlainObject(value)) return formatObject(value);
  return;
}

/**
 * Prints the `$` variants and semantic keys of an object-valued part prop, such
 * as `container={{ $border: true }}`. Other keys, like handlers or stores, are
 * wiring rather than styling and stay out.
 */
function formatObject(object: Record<string, unknown>) {
  const entries: string[] = [];
  for (const key of Object.keys(object)) {
    if (!isPrintedKey(key)) continue;
    const value = formatValue(object[key]);
    if (value == null) continue;
    entries.push(`${key}: ${value}`);
  }
  if (entries.length === 0) return;
  return `{ ${entries.join(", ")} }`;
}

function formatAttribute(key: string, value: unknown) {
  if (value === true) return key;
  if (typeof value === "string") return `${key}=${formatString(value)}`;
  const formatted = formatValue(value);
  if (formatted == null) return;
  return `${key}={${formatted}}`;
}

function getAttributes(props: Record<string, unknown>) {
  const parts: string[] = [];
  // Object.keys keeps the order the props were written in, which makes the
  // server and client output identical.
  for (const key of Object.keys(props)) {
    if (key === "children") continue;
    const value = props[key];
    if (value == null) continue;
    // Element props and object-valued part props print under any name: they are
    // how a component composes its parts, and their `$` keys are variants.
    const isComposition = isValidElement(value) || isPlainObject(value);
    if (!isComposition && !isPrintedKey(key)) continue;
    const attribute = formatAttribute(key, value);
    if (attribute == null) continue;
    parts.push(attribute);
  }
  if (parts.length === 0) return "";
  return ` ${parts.join(" ")}`;
}

function getElementProps(element: ReactElement) {
  return (element.props ?? {}) as Record<string, unknown>;
}

/**
 * Prints an element that sits in a prop such as `render`, `button` or `icon`.
 * Host elements print as their tag here: `render={<a />}` is the point of the
 * prop, so hiding it would leave the prop empty.
 */
function printInlineElement(element: ReactElement): string {
  const { type } = element;
  const name =
    typeof type === "string" ? type : (getComponentName(type) ?? undefined);
  if (!name) {
    if (typeof type === "symbol") return printInlineChildren(element);
    throwUnknownType(type);
  }
  const props = getElementProps(element);
  const attributes = getAttributes(props);
  const children = printInlineChildren(element);
  if (!children) return `<${name}${attributes} />`;
  return `<${name}${attributes}>${children}</${name}>`;
}

function printInlineChildren(element: ReactElement) {
  const parts: string[] = [];
  forEachChild(getElementProps(element).children as ReactNode, (child) => {
    if (isValidElement(child)) {
      parts.push(printInlineElement(child));
      return;
    }
    const text = getText(child);
    if (text) {
      parts.push(text);
    }
  });
  return parts.join("");
}

function forEachChild(node: ReactNode, callback: (child: ReactNode) => void) {
  if (node == null) return;
  if (typeof node === "boolean") return;
  if (Array.isArray(node)) {
    for (const child of node as ReactNode[]) {
      forEachChild(child, callback);
    }
    return;
  }
  callback(node);
}

function printChildren(node: ReactNode, depth: number, lines: string[]) {
  forEachChild(node, (child) => {
    if (isValidElement(child)) {
      printElement(child, depth, lines);
      return;
    }
    const text = getText(child);
    if (text) {
      lines.push(`${INDENT.repeat(depth)}${text}`);
    }
  });
}

function isLoneTextChild(children: ReactNode) {
  if (typeof children === "string") return true;
  return typeof children === "number";
}

/**
 * A host element that sets a writing direction, such as the
 * `<div dir="rtl" lang="ar">` wrapper of a right-to-left box, is the one host
 * wrapper a reader needs to see: the direction is what the box is about.
 */
function getDirectionWrapper(type: unknown, props: Record<string, unknown>) {
  if (typeof type !== "string") return;
  if (typeof props.dir !== "string") return;
  return { name: type, attributes: ` dir=${JSON.stringify(props.dir)}` };
}

function printElement(element: ReactElement, depth: number, lines: string[]) {
  const { type } = element;
  const props = getElementProps(element);
  const directionWrapper = getDirectionWrapper(type, props);
  if (!directionWrapper && isTransparentType(type)) {
    printChildren(props.children as ReactNode, depth, lines);
    return;
  }
  const name = directionWrapper?.name ?? getComponentName(type);
  if (!name) {
    throwUnknownType(type);
  }
  const attributes = directionWrapper?.attributes ?? getAttributes(props);
  const pad = INDENT.repeat(depth);
  const open = `<${name}${attributes}`;
  const childLines: string[] = [];
  printChildren(props.children as ReactNode, depth + 1, childLines);
  const [firstChildLine] = childLines;
  if (!firstChildLine) {
    lines.push(`${pad}${open} />`);
    return;
  }
  if (childLines.length === 1 && isLoneTextChild(props.children as ReactNode)) {
    lines.push(`${pad}${open}>${firstChildLine.trim()}</${name}>`);
    return;
  }
  lines.push(`${pad}${open}>`);
  lines.push(...childLines);
  lines.push(`${pad}</${name}>`);
}

/**
 * Turns an example's element tree into the snippet its box shows: the
 * `@ariakit/ui` components it renders and the variants it passes them. It is
 * not the example's source. Throws for a component it cannot name, which fails
 * the build rather than shipping a snippet nobody can read.
 */
export function serializeExample(node: ReactNode) {
  const lines: string[] = [];
  printChildren(node, 0, lines);
  return lines.join("\n");
}
