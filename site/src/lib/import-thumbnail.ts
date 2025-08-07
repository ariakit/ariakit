/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ComponentType } from "react";

export async function importThumbnail(name?: string) {
  if (!name) return undefined;
  const example = name.split("/").shift();
  try {
    const { default: Thumbnail } = await import(
      `../examples/${example}/thumbnail.react.tsx`
    );
    return Thumbnail as ComponentType;
  } catch (_error) {
    console.log(`Missing thumbnail for ${name}`);
    return undefined;
  }
}
