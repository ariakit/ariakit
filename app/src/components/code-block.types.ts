/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ThemedToken } from "shiki";
import type { CodeBlockLanguage } from "#app/lib/shiki.ts";
import type * as icons from "../icons/icons.ts";

type IconName = keyof typeof icons;

export interface TokenFragment {
  content: string;
  token: ThemedToken;
  isHighlighted: boolean;
  tokenIndex: number;
  isDiff?: boolean;
  charStart: number;
  charEnd: number;
}

export interface Segment {
  fragments: TokenFragment[];
  isHighlighted: boolean;
  spansMultipleTokens: boolean;
  isDiff?: boolean;
}

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
