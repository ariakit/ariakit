import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { prose } from "../styles/prose.ts";

export interface ProseProps
  extends ak.RoleProps<"div">, VariantProps<typeof prose> {}

/**
 * Renders a content container with consistent vertical spacing and styles for
 * paragraphs and strong emphasis. It sets the space around its direct `Heading`
 * children.
 * @example
 * <Prose>
 *   <p>Create a project to organize your work.</p>
 *   <p>Each project can have <strong>multiple members</strong>.</p>
 * </Prose>
 */
export function Prose(props: ProseProps) {
  const [variantProps, rest] = splitProps(props, prose);
  return <ak.Role.div {...prose.jsx(variantProps)} {...rest} />;
}
