import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { heading } from "../styles/heading.ts";

export interface HeadingProps
  extends ComponentProps<"h1">, VariantProps<typeof heading> {
  /**
   * Heading element to render. Use the `$level` variant when the visual size
   * should differ from the semantic level.
   * @default 2
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({ level = 2, ...props }: HeadingProps) {
  const [variantProps, rest] = splitProps(props, heading);
  const Tag = `h${level}` as const;
  return <Tag {...heading.jsx(variantProps)} {...rest} />;
}
