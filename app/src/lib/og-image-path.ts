/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Framework } from "./schemas.ts";
import { trim } from "./string.ts";

export interface GetPageOGImagePathParams {
  id?: string;
  type?: "pages" | "examples" | "components" | "styles";
  framework?: Framework;
  pagePath?: string;
}

export function getOGImagePath(pagePath: string) {
  const imageName = trim(pagePath, "/").replaceAll("/", "_") || "default";
  return `/og-image/${imageName}.png`;
}

export function getPageOGImagePath({
  id,
  type = "pages",
  framework,
  pagePath,
}: GetPageOGImagePathParams) {
  if (pagePath) {
    return getOGImagePath(pagePath);
  }
  if (type === "pages") {
    return getOGImagePath("/default");
  }
  if (type !== "components" && type !== "examples") {
    return getOGImagePath("/default");
  }
  if (!framework) {
    return getOGImagePath("/default");
  }
  if (id === "") {
    return getOGImagePath("/default");
  }
  const resolvedPagePath = id
    ? `/${framework}/${type}/${id}`
    : `/${framework}/${type}`;
  return getOGImagePath(resolvedPagePath);
}
