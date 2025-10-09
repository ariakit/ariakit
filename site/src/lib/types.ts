import type { StyleDependency } from "./styles.ts";
/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export interface Source {
  name: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  /**
   * Styles referenced by the source code. This follows the same shape as items
   * in `dependencies` arrays within `site/src/styles/styles.json` (name, type,
   * and optionally module/import).
   */
  styles: StyleDependency[];
}
