/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { expect, test } from "vitest";
import {
  findVarNamesInString,
  parseAtPropertyBody,
  parsePropertyDecls,
  resolveDependencies,
} from "./build-styles.ts";
import type { ModuleJson } from "./styles.ts";

test("findVarNamesInString finds names in nested var fallbacks", () => {
  expect(
    findVarNamesInString("var(--ak-table-px, var(--ak-frame-padding, 0))"),
  ).toEqual(["--ak-table-px", "--ak-frame-padding"]);
});

test("parsePropertyDecls preserves mid-declaration comments", () => {
  const decls = parsePropertyDecls(`
    color: red /* note */;
    width: calc(100% /* half */ - 2px);
  `);

  expect(decls).toEqual([
    { name: "color", value: "red /* note */" },
    { name: "width", value: "calc(100% /* half */ - 2px)" },
  ]);
});

test("parsePropertyDecls preserves standalone comments before @apply", () => {
  const decls = parsePropertyDecls(`
    /* Base styles */
    @apply ak-button;
  `);

  expect(decls).toEqual([
    { name: "/* Base styles */", value: {} },
    { name: "@apply ak-button", value: {} },
  ]);
});

test("parseAtPropertyBody preserves mid-declaration comments", () => {
  const def = parseAtPropertyBody(`
    syntax: "<length>";
    inherits: true;
    initial-value: calc(1px /* c */ + 2px);
  `);

  expect(def).toEqual({
    syntax: '"<length>"',
    inherits: "true",
    initialValue: "calc(1px /* c */ + 2px)",
  });
});

test("resolveDependencies ignores tokens in inline comments", () => {
  const styleModule: ModuleJson = {
    id: "test",
    path: "app/src/styles/ak-test.css",
    atProperties: {
      "--ak-real-prop": {
        name: "--ak-real-prop",
        syntax: null,
        inherits: null,
        initialValue: null,
      },
      "--ak-comment-prop": {
        name: "--ak-comment-prop",
        syntax: null,
        inherits: null,
        initialValue: null,
      },
      "--ak-string-prop": {
        name: "--ak-string-prop",
        syntax: null,
        inherits: null,
        initialValue: null,
      },
      "--ak-joined-prop": {
        name: "--ak-joined-prop",
        syntax: null,
        inherits: null,
        initialValue: null,
      },
    },
    utilities: {
      "ak-real-utility": {
        name: "ak-real-utility",
        type: "utility",
        properties: [],
        dependencies: [],
      },
      "ak-comment-utility": {
        name: "ak-comment-utility",
        type: "utility",
        properties: [],
        dependencies: [],
      },
      "ak-source": {
        name: "ak-source",
        type: "utility",
        properties: [
          {
            name: "@apply ak-real-utility /* ak-comment-utility */",
            value: {},
          },
          {
            name: "color",
            value:
              "red var(--ak-real-prop) /* ak-comment-utility var(--ak-comment-prop) */",
          },
          {
            name: "content",
            value:
              '"/*" var(--ak-string-prop) "*/" /* var(--ak-comment-prop) */',
          },
          {
            name: "border-color",
            value: "var(--ak-joined/* comment */-prop)",
          },
          {
            name: "@variant ak-real-variant /* ak-comment-variant */",
            value: [{ name: "@slot", value: {} }],
          },
        ],
        dependencies: [],
      },
    },
    variants: {
      "ak-real-variant": {
        name: "ak-real-variant",
        type: "variant",
        properties: [],
        dependencies: [],
      },
      "ak-comment-variant": {
        name: "ak-comment-variant",
        type: "variant",
        properties: [],
        dependencies: [],
      },
    },
  };

  resolveDependencies([styleModule]);

  const source = styleModule.utilities["ak-source"];

  expect(source?.dependencies).toEqual([
    { type: "utility", name: "ak-real-utility", module: "test" },
    { type: "at-property", name: "--ak-real-prop", module: "test" },
    { type: "at-property", name: "--ak-string-prop", module: "test" },
    { type: "variant", name: "ak-real-variant", module: "test" },
  ]);
});
