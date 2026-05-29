/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

/** JSON shape for `#app/styles/styles.json` (shared by `env.d.ts` and `styles.ts`). */

export type StyleType = "utility" | "variant" | "at-property";

export interface StyleDependency {
  type: StyleType;
  name: string;
  module?: string;
  import?: string;
}

export interface PropertyDecl {
  name: string;
  value: string | PropertyDecl[] | Record<string, never>;
}

export interface AtPropertyDef {
  name: string;
  syntax: string | null;
  inherits: string | null;
  initialValue: string | null;
}

export interface UtilityDef {
  name: string;
  type: "utility";
  properties: PropertyDecl[];
  dependencies: StyleDependency[];
}

export interface VariantDef {
  name: string;
  type: "variant";
  properties: PropertyDecl[];
  dependencies: StyleDependency[];
}

export type StyleDef = UtilityDef | VariantDef | AtPropertyDef;

export interface ModuleJson {
  id: string;
  path: string;
  atProperties: Record<string, AtPropertyDef>;
  utilities: Record<string, UtilityDef>;
  variants: Record<string, VariantDef>;
}

export interface StylesJson {
  version: number;
  modules: ModuleJson[];
  index: {
    utilities: Record<string, { module: string }>;
    variants: Record<string, { module: string }>;
    atProperties: Record<string, { module: string }>;
  };
}
