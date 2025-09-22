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
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

export async function importThumbnail(name?: string) {
  if (!name) return;
  const example = name.split("/").shift();
  try {
    const { default: Thumbnail } = await import(
      `../examples/${example}/thumbnail.react.tsx`
    );
    return Thumbnail as ComponentType;
  } catch (_error) {
    console.log(`Missing thumbnail for ${name}`);
    return;
  }
}

export async function renderThumbnail(name?: string) {
  const Thumbnail = await importThumbnail(name);
  if (!Thumbnail) return;
  return renderToStaticMarkup(createElement(Thumbnail));
}
