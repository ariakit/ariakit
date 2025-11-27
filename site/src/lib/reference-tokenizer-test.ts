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

interface RefProp {
  name: string;
  type: string;
  description: string;
  optional: boolean;
  deprecated: string | boolean;
  examples: [];
  liveExamples: [];
  props?: RefProp[];
}

interface RefData {
  name: string;
  component: string;
  kind: "component" | "function" | "store";
  framework: "react" | "solid";
  description: string;
  deprecated: string | boolean;
  examples: [];
  liveExamples: [];
  state: RefProp[];
  params: RefProp[];
  returnValue?: { type: string; description: string; props?: RefProp[] };
}

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
  opts: {
    state?: RefProp[];
    params?: RefProp[];
    returnProps?: RefProp[];
    framework?: RefData["framework"];
  } = {},
): RefData {
  return {
    name,
    component,
    kind,
    framework: opts.framework ?? "react",
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
        createProp("props", {
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
      params: [createProp("props", { optional: true })],
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

  const compSeparatorSolid = makeRef(
    "solid/separator/component",
    createRefData("component", "Separator", "separator", {
      framework: "solid",
      params: [
        createProp("props", {
          optional: true,
          props: [createProp("orientation")],
        }),
      ],
    }),
  );

  return [
    storeCombobox,
    ctxCombobox,
    compDisclosure,
    storeDisclosure,
    ctxDisclosure,
    compDisclosureProvider,
    compSeparator,
    compSeparatorSolid,
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "store",
        "line": 2,
        "text": "useComboboxStore",
      },
      {
        "kind": "prop",
        "line": 3,
        "text": "value",
      },
    ]
  `);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "store",
        "line": 2,
        "text": "useComboboxStore",
      },
      {
        "kind": "prop",
        "line": 3,
        "text": "value",
      },
    ]
  `);
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
  expect(ts.length).toBe(0);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "component",
        "line": 2,
        "text": "DisclosureProvider",
      },
      {
        "kind": "prop",
        "line": 2,
        "text": "defaultOpen",
      },
    ]
  `);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "component",
        "line": 4,
        "text": "Disclosure",
      },
      {
        "kind": "prop",
        "line": 4,
        "text": "ak-text/0",
      },
    ]
  `);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "prop",
        "line": 5,
        "text": "ak-disclosure",
      },
      {
        "kind": "prop",
        "line": 5,
        "text": "ak-text/0",
      },
    ]
  `);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "component",
        "line": 1,
        "text": "AriakitDisclosure",
      },
      {
        "kind": "component",
        "line": 2,
        "text": "AriakitDisclosure",
      },
    ]
  `);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "component",
        "line": 1,
        "text": "Separator",
      },
    ]
  `);
});

test("solid: tokenizes component usage after named import", () => {
  const code = `
import { Separator } from "@ariakit/solid";
export default function Example() {
  return <Separator orientation="horizontal" class="ak-layer-current" />;
}
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "solid",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "component",
        "line": 1,
        "text": "Separator",
      },
      {
        "kind": "component",
        "line": 3,
        "text": "Separator",
      },
      {
        "kind": "prop",
        "line": 3,
        "text": "orientation",
      },
      {
        "kind": "prop",
        "line": 3,
        "text": "ak-layer-current",
      },
    ]
  `);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "function",
        "line": 2,
        "text": "useDisclosureContext",
      },
      {
        "kind": "prop",
        "line": 3,
        "text": "mounted",
      },
      {
        "kind": "prop",
        "line": 4,
        "text": "getState",
      },
    ]
  `);
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
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "store",
        "line": 1,
        "text": "useComboboxStore",
      },
      {
        "kind": "prop",
        "line": 2,
        "text": "value",
      },
    ]
  `);
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
  expect(ts.length).toBe(0);
});

test("does not tokenize generic type parameters as JSX tags", () => {
  const code = `export function Example<Disclosure>() {`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.length).toBe(0);
});

test("tokenizes namespace component tag with props", () => {
  const code = `
import * as ak from "@ariakit/react";
export function X() { return <ak.Disclosure render />; }
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "component",
        "line": 2,
        "text": "Disclosure",
      },
      {
        "kind": "prop",
        "line": 2,
        "text": "render",
      },
    ]
  `);
});

test("tokenizes direct named import store call with object props", () => {
  const code = `
import { useComboboxStore } from "@ariakit/react";
const combobox = useComboboxStore({ setMounted: () => {} });
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "store",
        "line": 1,
        "text": "useComboboxStore",
      },
      {
        "kind": "store",
        "line": 2,
        "text": "useComboboxStore",
      },
      {
        "kind": "prop",
        "line": 2,
        "text": "setMounted",
      },
    ]
  `);
});

test("tokenizes aliased store import and usage", () => {
  const code = `
import { useDisclosureStore as useStore } from "@ariakit/react";
const store = useStore();
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "store",
        "line": 1,
        "text": "useStore",
      },
      {
        "kind": "store",
        "line": 2,
        "text": "useStore",
      },
    ]
  `);
});

test("tokenizes multiple ak- classes in one className", () => {
  const code = `<div className="ak-button ak-primary ak-disabled" />`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "prop",
        "line": 1,
        "text": "ak-button",
      },
      {
        "kind": "prop",
        "line": 1,
        "text": "ak-primary",
      },
      {
        "kind": "prop",
        "line": 1,
        "text": "ak-disabled",
      },
    ]
  `);
});

test("tokenizes ak- classes in template literal static parts only", () => {
  // Note: ak- classes inside ${} interpolations are intentionally skipped
  // because they could be dynamic values (variables, expressions, etc.)
  const code = `<div className={\`ak-button ak-primary \${isActive ? "active" : "inactive"}\`} />`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "prop",
        "line": 1,
        "text": "ak-button",
      },
      {
        "kind": "prop",
        "line": 1,
        "text": "ak-primary",
      },
    ]
  `);
});

test("tokenizes multiple store return-props", () => {
  const code = `
import * as ak from "@ariakit/react";
const disclosure = ak.useDisclosureStore();
disclosure.open;
disclosure.setOpen(true);
disclosure.getState();
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "store",
        "line": 2,
        "text": "useDisclosureStore",
      },
      {
        "kind": "prop",
        "line": 3,
        "text": "open",
      },
      {
        "kind": "prop",
        "line": 4,
        "text": "setOpen",
      },
      {
        "kind": "prop",
        "line": 5,
        "text": "getState",
      },
    ]
  `);
});

test("does not tokenize closing tags", () => {
  const code = `
import { Disclosure } from "@ariakit/react";
export function X() {
  return <Disclosure>content</Disclosure>;
}
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "component",
        "line": 1,
        "text": "Disclosure",
      },
      {
        "kind": "component",
        "line": 3,
        "text": "Disclosure",
      },
    ]
  `);
});

test("tokenizes context hook with store state reference", () => {
  const code = `
import { useDisclosureContext, useStoreState } from "@ariakit/react";
const disclosure = useDisclosureContext();
const mounted = useStoreState(disclosure, "mounted");
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts).toMatchInlineSnapshot(`
    [
      {
        "kind": "function",
        "line": 1,
        "text": "useDisclosureContext",
      },
      {
        "kind": "function",
        "line": 2,
        "text": "useDisclosureContext",
      },
      {
        "kind": "prop",
        "line": 3,
        "text": "mounted",
      },
    ]
  `);
});

test("does not tokenize locally defined functions with same name", () => {
  const code = `
import { something } from "other-lib";
function useDisclosureStore() { return {}; }
const store = useDisclosureStore();
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.length).toBe(0);
});

test("handles empty references gracefully", () => {
  const code = `
import { Disclosure } from "@ariakit/react";
<Disclosure render />
`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: [],
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.length).toBe(0);
});

test("handles code without any relevant patterns", () => {
  const code = `const x = 1; const y = 2;`;
  const perLine = findCodeReferenceAnchors({
    code,
    references: refs(),
    framework: "react",
  });
  const ts = tokensAt(code, perLine);
  expect(ts.length).toBe(0);
});
