/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { CollectionEntry } from "astro:content";
import { findCodeReferenceAnchors } from "./reference-tokenizer.ts";

type RefProp = {
  name: string;
  type: string;
  description: string;
  optional: boolean;
  deprecated: string | boolean;
  examples: [];
  liveExamples: [];
  props?: RefProp[];
};

type RefData = {
  name: string;
  component: string;
  kind: "component" | "function" | "store";
  framework: "react";
  description: string;
  deprecated: string | boolean;
  examples: [];
  liveExamples: [];
  state: RefProp[];
  params: RefProp[];
  returnValue?: { type: string; description: string; props?: RefProp[] };
};

function createProp(
  name: string,
  opts: { optional?: boolean; props?: RefProp[] } = {},
): RefProp {
  return {
    name,
    type: "any",
    description: "",
    optional: Boolean(opts.optional),
    deprecated: false,
    examples: [],
    liveExamples: [],
    ...(opts.props ? { props: opts.props } : {}),
  };
}

function createRefData(
  kind: RefData["kind"],
  name: string,
  component: string,
  opts: { state?: RefProp[]; params?: RefProp[]; returnProps?: RefProp[] } = {},
): RefData {
  return {
    name,
    component,
    kind,
    framework: "react",
    description: "",
    deprecated: false,
    examples: [],
    liveExamples: [],
    state: opts.state ?? [],
    params: opts.params ?? [],
    ...(opts.returnProps
      ? {
          returnValue: {
            type: "object",
            description: "",
            props: opts.returnProps,
          },
        }
      : {}),
  };
}

function makeRef(id: string, data: RefData): CollectionEntry<"references"> {
  return { id, data } as unknown as CollectionEntry<"references">;
}

function refs(): CollectionEntry<"references">[] {
  const storeCombobox = makeRef(
    "react/combobox/store",
    createRefData("store", "useComboboxStore", "combobox", {
      state: [createProp("value")],
      params: [
        createProp("options", {
          optional: true,
          props: [createProp("setMounted")],
        }),
      ],
      returnProps: [
        createProp("open"),
        createProp("setOpen"),
        createProp("getState"),
      ],
    }),
  );

  const ctxCombobox = makeRef(
    "react/combobox/context",
    createRefData("function", "useComboboxContext", "combobox"),
  );

  const compDisclosure = makeRef(
    "react/disclosure/component",
    createRefData("component", "Disclosure", "disclosure", {
      params: [
        createProp("props", { optional: true, props: [createProp("render")] }),
      ],
    }),
  );

  const storeDisclosure = makeRef(
    "react/disclosure/store",
    createRefData("store", "useDisclosureStore", "disclosure", {
      state: [createProp("mounted")],
      params: [createProp("options", { optional: true })],
      returnProps: [
        createProp("getState"),
        createProp("open"),
        createProp("setOpen"),
      ],
    }),
  );

  const ctxDisclosure = makeRef(
    "react/disclosure/context",
    createRefData("function", "useDisclosureContext", "disclosure"),
  );

  const compDisclosureProvider = makeRef(
    "react/disclosure/provider",
    createRefData("component", "DisclosureProvider", "disclosure", {
      params: [
        createProp("props", {
          optional: true,
          props: [createProp("defaultOpen")],
        }),
      ],
    }),
  );

  const compSeparator = makeRef(
    "react/separator/component",
    createRefData("component", "Separator", "separator"),
  );

  return [
    storeCombobox,
    ctxCombobox,
    compDisclosure,
    storeDisclosure,
    ctxDisclosure,
    compDisclosureProvider,
    compSeparator,
  ];
}

function tokensAt(
  code: string,
  perLine: ReturnType<typeof findCodeReferenceAnchors>,
) {
  const lines = code.trim().split("\n");
  const out: { text: string; kind: string; line: number }[] = [];
  perLine.forEach((ranges, i) => {
    const line = lines[i] || "";
    for (const r of ranges) {
      out.push({ text: line.slice(r.start, r.end), kind: r.kind, line: i + 1 });
    }
  });
  return out;
}

test("tokenizes useStoreState state key (string) with ak namespace", () => {
  const code = `
import * as ak from "@ariakit/react";
const combobox = ak.useComboboxStore();
const value = ak.useStoreState(combobox, "value");
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text === "value" && t.kind === "prop")).toBe(true);
});

test("tokenizes useStoreState state key (arrow) with ak namespace", () => {
  const code = `
import * as ak from "@ariakit/react";
const combobox = ak.useComboboxStore();
const value = ak.useStoreState(combobox, (state) => state.value);
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text === "value" && t.kind === "prop")).toBe(true);
});

test("does not tokenize props on non-Ariakit namespaced components (rac.Disclosure)", () => {
  const code = `
import * as rac from "react-aria-components";
export function X(){return (<rac.Disclosure render />)}
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text === "render")).toBe(false);
});

test("tokenizes defaultOpen boolean prop on ak.DisclosureProvider", () => {
  const code = `
import * as ak from "@ariakit/react";
export function X(){return (<ak.DisclosureProvider defaultOpen />)}
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text === "defaultOpen" && t.kind === "prop")).toBe(
    true,
  );
});

test("tokenizes ak- classes inside nested clsx in object props", () => {
  const code = `
import * as ak from "@ariakit/react";
const completed = false;
export function X(){return (
  <ak.Disclosure button={{ className: clsx(completed && "not-data-open:ak-text/0") }} />
)}
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text.includes("ak-text/0"))).toBe(true);
});

test("does not tokenize props for rac.Disclosure but tokenizes ak- in className", () => {
  const code = `
import * as rac from "react-aria-components";
export function X(){return (
  <rac.Disclosure
    render
    className={clsx("ak-disclosure", true && "not-data-open:ak-text/0")}
  />
)}
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text === "render")).toBe(false);
  expect(ts.some((t) => t.text.includes("ak-text/0"))).toBe(true);
});

test("tokenizes renamed component import and tag", () => {
  const code = `
import { Disclosure as AriakitDisclosure } from "@ariakit/react";
export function X(){return (<AriakitDisclosure />)}
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(
    ts.some((t) => t.text === "AriakitDisclosure" && t.kind === "component"),
  ).toBe(true);
});

test("tokenizes import named identifier position precisely", () => {
  const code = `
import { Separator } from "@ariakit/react";
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  // ensure only the word Separator is tokenized
  expect(ts).toContainEqual(
    expect.objectContaining({ text: "Separator", kind: "component" }),
  );
  expect(ts.some((t) => /port|\{\s*Se/.test(t.text))).toBe(false);
});

test("tokenizes return-prop without trailing punctuation", () => {
  const code = `
import * as ak from "@ariakit/react";
const disclosure = ak.useDisclosureContext();
const mounted = ak.useStoreState(disclosure, "mounted");
function demo(){ if(!disclosure) return; const { contentElement } = disclosure.getState(); }
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text === "getState" && t.kind === "prop")).toBe(true);
  expect(ts.some((t) => t.text === "getState;")).toBe(false);
});

test("fallback with no imports: namespaced calls are allowed", () => {
  const code = `
const combobox = Ariakit.useComboboxStore();
const value = Ariakit.useStoreState(combobox, "value");
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.text === "value" && t.kind === "prop")).toBe(true);
});

test("does not tokenize function declarations as components", () => {
  const code = `
export function Disclosure(){ return null }
export function DisclosureContent(){ return null }
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.some((t) => t.kind === "component")).toBe(false);
});
