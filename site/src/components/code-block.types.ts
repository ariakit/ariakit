import type { HTMLAttributes } from "astro/types";
import type { BundledLanguage, CodeToTokensOptions } from "shiki";
import type * as icons from "../icons/icons.ts";

type Lang = CodeToTokensOptions<BundledLanguage>["lang"];
type IconName = keyof typeof icons;

export interface CodeBlockProps extends HTMLAttributes<"div"> {
  code: string;
  filename?: string;
  filenameIcon?: IconName;
  showFilename?: boolean;
  lang?: Lang;
  maxLines?: number;
  lineNumbers?: boolean;
  highlightLines?: number[];
  highlightTokens?: (string | readonly [string, number[]])[];
}
