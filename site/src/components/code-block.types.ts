import type { BundledLanguage } from "shiki";
import type * as icons from "../icons/icons.ts";

type IconName = keyof typeof icons;

export interface CodeBlockProps {
  code: string;
  filename?: string;
  filenameIcon?: IconName;
  lang?: BundledLanguage;
  maxLines?: number;
  lineNumbers?: boolean;
  highlightLines?: number[];
  highlightTokens?: (string | readonly [string, ...number[]])[];
}

export interface CodeBlockTabProps extends CodeBlockProps {
  filename: string;
}
