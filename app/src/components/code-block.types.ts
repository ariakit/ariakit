/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { CodeBlockLanguage } from "#app/lib/shiki.ts";
import type * as icons from "../icons/icons.ts";

type IconName = keyof typeof icons;

export interface CodeBlockProps {
  code: string;
  previousCode?: string;
  preferMultilineDiff?: boolean | number;
  filename?: string;
  filenameIcon?: IconName;
  lang?: CodeBlockLanguage;
  maxLines?: number;
  lineNumbers?: boolean;
  highlightLines?: number[];
  highlightTokens?: (string | readonly [string, ...number[]])[];
}

export interface CodeBlockTabProps extends CodeBlockProps {
  filename: string;
}
