import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
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

export function Heading(props: HeadingProps) {
  const [own, variantProps, rest] = splitProps(
    props,
    ["level"],
    heading.html.propKeys,
  );
  return (
    <Dynamic
      component={`h${own.level ?? 2}`}
      {...heading.html(variantProps)}
      {...rest}
    />
  );
}
