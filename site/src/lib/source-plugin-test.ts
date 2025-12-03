/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

// Integration tests for the source-plugin Vite plugin. These tests import
// actual example files with the ?source suffix to verify the plugin correctly
// extracts source code, dependencies, and styles.

import { join } from "node:path";
import nextjs from "nextjs/app/tab-nextjs/layout.tsx?source";
import disclosure from "#app/examples/disclosure/index.react.tsx?source";

const EXAMPLES_DIR = join(import.meta.dirname, "../examples/");
const NEXTJS_DIR = join(import.meta.dirname, "../../../nextjs/app/");

function normalizeSourcePath(path: string) {
  return path.replace(EXAMPLES_DIR, "").replace(NEXTJS_DIR, "");
}

test("disclosure name", () => {
  expect(disclosure.name).toBe("disclosure");
});

test("disclosure dependencies", () => {
  expect(Object.keys(disclosure.dependencies)).toMatchInlineSnapshot(`
    [
      "react",
      "react-dom",
      "@ariakit/react",
      "clsx",
    ]
  `);
});

test("disclosure dev dependencies", () => {
  expect(Object.keys(disclosure.devDependencies)).toMatchInlineSnapshot(`
    [
      "@types/react",
      "@types/react-dom",
    ]
  `);
});

test("disclosure file names", () => {
  expect(Object.keys(disclosure.files)).toMatchInlineSnapshot(`
    [
      "index.tsx",
      "disclosure.tsx",
      "utils.ts",
    ]
  `);
});

test("disclosure source names", () => {
  const sourceKeys = Object.keys(disclosure.sources).map(normalizeSourcePath);
  expect(sourceKeys).toMatchInlineSnapshot(`
    [
      "disclosure/index.react.tsx",
      "_lib/ariakit/disclosure.react.tsx",
      "_lib/react-utils/create-render.ts",
      "_lib/react-utils/is-iterable.ts",
      "_lib/react-utils/merge-props.ts",
    ]
  `);
});

test("nextjs name", () => {
  expect(nextjs.name).toBe("tab-nextjs");
});

test("nextjs dependencies", () => {
  expect(Object.keys(nextjs.dependencies)).toMatchInlineSnapshot(`
    [
      "react",
      "next",
      "react-dom",
      "@ariakit/react",
      "clsx",
    ]
  `);
});

test("nextjs dev dependencies", () => {
  expect(Object.keys(nextjs.devDependencies)).toMatchInlineSnapshot(`
    [
      "@types/react",
      "@types/react-dom",
    ]
  `);
});

test("nextjs file names", () => {
  expect(Object.keys(nextjs.files)).toMatchInlineSnapshot(`
    [
      "layout.tsx",
      "disclosure.tsx",
      "tabs.tsx",
      "page.tsx",
      "@tabs/new/page.tsx",
      "@tabs/page.tsx",
      "utils.ts",
    ]
  `);
});

test("nextjs source names", () => {
  const sourceKeys = Object.keys(nextjs.sources).map(normalizeSourcePath);
  expect(sourceKeys).toMatchInlineSnapshot(`
    [
      "tab-nextjs/layout.tsx",
      "_lib/ariakit/disclosure.react.tsx",
      "_lib/react-utils/create-render.ts",
      "_lib/react-utils/is-iterable.ts",
      "_lib/react-utils/merge-props.ts",
      "tab-nextjs/tabs.tsx",
      "tab-nextjs/page.tsx",
      "tab-nextjs/@tabs/new/page.tsx",
      "tab-nextjs/@tabs/page.tsx",
    ]
  `);
});

test("disclosure sources", () => {
  const sources = Object.values(disclosure.sources).map((source) => ({
    id: normalizeSourcePath(source.id),
    dependencies: Object.keys(source.dependencies ?? {}),
    devDependencies: Object.keys(source.devDependencies ?? {}),
    styles: source.styles?.map((style) => style.name),
  }));
  expect(sources).toMatchInlineSnapshot(`
    [
      {
        "dependencies": [
          "react",
          "react-dom",
        ],
        "devDependencies": [
          "@types/react",
          "@types/react-dom",
        ],
        "id": "disclosure/index.react.tsx",
        "styles": [],
      },
      {
        "dependencies": [
          "react",
          "react-dom",
          "@ariakit/react",
          "clsx",
        ],
        "devDependencies": [
          "@types/react",
          "@types/react-dom",
        ],
        "id": "_lib/ariakit/disclosure.react.tsx",
        "styles": [
          "ak-disclosure_open",
          "ak-disclosure",
          "ak-disclosure-split",
          "ak-disclosure-group",
          "ak-disclosure-group",
          "ak-disclosure-actions",
          "ak-disclosure-icon",
          "ak-disclosure-button",
          "ak-command-depth-*",
          "ak-disclosure-chevron-down",
          "ak-disclosure-chevron-right",
          "ak-disclosure-plus",
          "ak-disclosure-content_open",
          "ak-disclosure-content",
          "ak-disclosure-guide",
          "ak-disclosure-content-body",
          "ak-prose",
          "ak-prose-gap-*",
          "ak-disclosure-content-base_open",
          "ak-disclosure_idle",
          "ak-disclosure-hover",
          "ak-disclosure_hover",
          "ak-frame-cover",
          "ak-disclosure-content-base_idle",
          "ak-layer-hover",
          "ak-disclosure-button_idle",
          "ak-disclosure-open",
          "ak-disclosure-button_open",
          "ak-command-hover",
          "ak-disclosure-button_hover",
          "ak-command-focus",
          "ak-disclosure-button_focus",
          "ak-command-active",
          "ak-disclosure-button_active",
          "ak-command-disabled",
          "ak-disclosure-button_disabled",
          "ak-layer-current",
          "ak-command-depth-x-3",
          "ak-button_idle",
          "ak-text",
          "ak-frame-force-(--ak-disclosure-button-radius)/(--ak-disclosure-padding)",
          "ak-button_focus",
          "ak-button_active",
          "ak-button_disabled",
          "ak-command_idle",
          "ak-outline-primary",
          "ak-frame-field",
          "ak-command_focus",
          "ak-command_active",
          "ak-text/50",
          "ak-layer-mix/20",
          "--ak-command-depth-x",
          "--ak-command-depth-y",
          "ak-layer-hover-0",
          "ak-frame-none/card",
          "ak-disclosure-chevron-down_idle",
          "ak-disclosure-chevron-down_open",
          "ak-disclosure-chevron-right_idle",
          "ak-icon-chevron",
          "ak-icon",
          "ak-disclosure-chevron-right_open",
          "ak-disclosure-plus_idle",
          "ak-disclosure-plus_open",
          "ak-disclosure-content_idle",
          "ak-prose-text",
          "ak-prose-text-base/relaxed",
          "ak-prose-elements",
          "ak-prose-content",
          "ak-dark",
          "ak-text/75",
          "ak-light",
          "ak-text/90",
          "ak-heading",
          "ak-list",
          "ak-list-leading-(--ak-prose-leading)",
          "ak-list-gap-(--ak-prose-gap)",
          "ak-list-item",
          "ak-strong",
          "ak-code",
          "ak-link",
          "ak-kbd",
          "ak-separator",
          "ak-link_idle",
          "ak-heading-1",
          "ak-heading-2",
          "ak-heading-3",
          "ak-heading-4",
          "ak-heading-5",
          "ak-list-gap-4",
          "ak-list-leading-normal",
          "ak-list-counter-reset",
          "ak-list-item-padding-1",
          "ak-list-ul",
          "ak-list-ol",
          "ak-list-gap-2",
          "ak-list-blocks",
          "ak-list-sections",
          "ak-list-blocks",
          "ak-list-sections",
          "ak-list-item_base",
          "ak-list-item-blocks",
          "ak-list-disclosure",
          "ak-list-disclosure-button",
          "ak-list-disclosure-content-body",
          "ak-list-item-blocks",
          "ak-layer-pop",
          "ak-edge/15",
          "ak-link_hover",
          "ak-link_focus",
          "ak-layer-pop-1.5",
          "ak-edge-5/100",
          "ak-edge/16",
          "ak-dark",
          "ak-edge/20",
          "ak-text-primary",
          "ak-list-item-padding-2",
          "ak-list-item-border-1",
          "ak-list-item-border-0",
          "ak-frame-card/(--ak-list-item-padding)",
          "ak-list-item-ul",
          "ak-list-item-ol",
          "ak-list-ul",
          "ak-list-ol",
          "ak-list-item-ol-marker",
          "ak-list-item-ul-marker",
          "ak-list-counter-increment",
          "ak-list-item-ol-border",
          "ak-list-counter",
          "ak-edge/40",
          "ak-layer-pop-2",
          "ak-list-counter-content",
        ],
      },
      {
        "dependencies": [
          "react",
        ],
        "devDependencies": [
          "@types/react",
        ],
        "id": "_lib/react-utils/create-render.ts",
        "styles": [],
      },
      {
        "dependencies": [],
        "devDependencies": [],
        "id": "_lib/react-utils/is-iterable.ts",
        "styles": [],
      },
      {
        "dependencies": [
          "react",
        ],
        "devDependencies": [
          "@types/react",
        ],
        "id": "_lib/react-utils/merge-props.ts",
        "styles": [],
      },
    ]
  `);
});

test("nextjs sources", () => {
  const sources = Object.values(nextjs.sources).map((source) => ({
    id: normalizeSourcePath(source.id),
    dependencies: Object.keys(source.dependencies ?? {}),
    devDependencies: Object.keys(source.devDependencies ?? {}),
    styles: source.styles?.map((style) => style.name),
  }));
  expect(sources).toMatchInlineSnapshot(`
    [
      {
        "dependencies": [
          "react",
          "next",
        ],
        "devDependencies": [
          "@types/react",
        ],
        "id": "tab-nextjs/layout.tsx",
        "styles": [],
      },
      {
        "dependencies": [
          "react",
          "react-dom",
          "@ariakit/react",
          "clsx",
        ],
        "devDependencies": [
          "@types/react",
          "@types/react-dom",
        ],
        "id": "_lib/ariakit/disclosure.react.tsx",
        "styles": [
          "ak-disclosure_open",
          "ak-disclosure",
          "ak-disclosure-split",
          "ak-disclosure-group",
          "ak-disclosure-group",
          "ak-disclosure-actions",
          "ak-disclosure-icon",
          "ak-disclosure-button",
          "ak-command-depth-*",
          "ak-disclosure-chevron-down",
          "ak-disclosure-chevron-right",
          "ak-disclosure-plus",
          "ak-disclosure-content_open",
          "ak-disclosure-content",
          "ak-disclosure-guide",
          "ak-disclosure-content-body",
          "ak-prose",
          "ak-prose-gap-*",
          "ak-disclosure-content-base_open",
          "ak-disclosure_idle",
          "ak-disclosure-hover",
          "ak-disclosure_hover",
          "ak-frame-cover",
          "ak-disclosure-content-base_idle",
          "ak-layer-hover",
          "ak-disclosure-button_idle",
          "ak-disclosure-open",
          "ak-disclosure-button_open",
          "ak-command-hover",
          "ak-disclosure-button_hover",
          "ak-command-focus",
          "ak-disclosure-button_focus",
          "ak-command-active",
          "ak-disclosure-button_active",
          "ak-command-disabled",
          "ak-disclosure-button_disabled",
          "ak-layer-current",
          "ak-command-depth-x-3",
          "ak-button_idle",
          "ak-text",
          "ak-frame-force-(--ak-disclosure-button-radius)/(--ak-disclosure-padding)",
          "ak-button_focus",
          "ak-button_active",
          "ak-button_disabled",
          "ak-command_idle",
          "ak-outline-primary",
          "ak-frame-field",
          "ak-command_focus",
          "ak-command_active",
          "ak-text/50",
          "ak-layer-mix/20",
          "--ak-command-depth-x",
          "--ak-command-depth-y",
          "ak-layer-hover-0",
          "ak-frame-none/card",
          "ak-disclosure-chevron-down_idle",
          "ak-disclosure-chevron-down_open",
          "ak-disclosure-chevron-right_idle",
          "ak-icon-chevron",
          "ak-icon",
          "ak-disclosure-chevron-right_open",
          "ak-disclosure-plus_idle",
          "ak-disclosure-plus_open",
          "ak-disclosure-content_idle",
          "ak-prose-text",
          "ak-prose-text-base/relaxed",
          "ak-prose-elements",
          "ak-prose-content",
          "ak-dark",
          "ak-text/75",
          "ak-light",
          "ak-text/90",
          "ak-heading",
          "ak-list",
          "ak-list-leading-(--ak-prose-leading)",
          "ak-list-gap-(--ak-prose-gap)",
          "ak-list-item",
          "ak-strong",
          "ak-code",
          "ak-link",
          "ak-kbd",
          "ak-separator",
          "ak-link_idle",
          "ak-heading-1",
          "ak-heading-2",
          "ak-heading-3",
          "ak-heading-4",
          "ak-heading-5",
          "ak-list-gap-4",
          "ak-list-leading-normal",
          "ak-list-counter-reset",
          "ak-list-item-padding-1",
          "ak-list-ul",
          "ak-list-ol",
          "ak-list-gap-2",
          "ak-list-blocks",
          "ak-list-sections",
          "ak-list-blocks",
          "ak-list-sections",
          "ak-list-item_base",
          "ak-list-item-blocks",
          "ak-list-disclosure",
          "ak-list-disclosure-button",
          "ak-list-disclosure-content-body",
          "ak-list-item-blocks",
          "ak-layer-pop",
          "ak-edge/15",
          "ak-link_hover",
          "ak-link_focus",
          "ak-layer-pop-1.5",
          "ak-edge-5/100",
          "ak-edge/16",
          "ak-dark",
          "ak-edge/20",
          "ak-text-primary",
          "ak-list-item-padding-2",
          "ak-list-item-border-1",
          "ak-list-item-border-0",
          "ak-frame-card/(--ak-list-item-padding)",
          "ak-list-item-ul",
          "ak-list-item-ol",
          "ak-list-ul",
          "ak-list-ol",
          "ak-list-item-ol-marker",
          "ak-list-item-ul-marker",
          "ak-list-counter-increment",
          "ak-list-item-ol-border",
          "ak-list-counter",
          "ak-edge/40",
          "ak-layer-pop-2",
          "ak-list-counter-content",
        ],
      },
      {
        "dependencies": [
          "react",
        ],
        "devDependencies": [
          "@types/react",
        ],
        "id": "_lib/react-utils/create-render.ts",
        "styles": [],
      },
      {
        "dependencies": [],
        "devDependencies": [],
        "id": "_lib/react-utils/is-iterable.ts",
        "styles": [],
      },
      {
        "dependencies": [
          "react",
        ],
        "devDependencies": [
          "@types/react",
        ],
        "id": "_lib/react-utils/merge-props.ts",
        "styles": [],
      },
      {
        "dependencies": [
          "@ariakit/react",
          "clsx",
          "next",
          "react",
        ],
        "devDependencies": [
          "@types/react",
        ],
        "id": "tab-nextjs/tabs.tsx",
        "styles": [],
      },
      {
        "dependencies": [],
        "devDependencies": [],
        "id": "tab-nextjs/page.tsx",
        "styles": [],
      },
      {
        "dependencies": [],
        "devDependencies": [],
        "id": "tab-nextjs/@tabs/new/page.tsx",
        "styles": [],
      },
      {
        "dependencies": [],
        "devDependencies": [],
        "id": "tab-nextjs/@tabs/page.tsx",
        "styles": [],
      },
    ]
  `);
});
