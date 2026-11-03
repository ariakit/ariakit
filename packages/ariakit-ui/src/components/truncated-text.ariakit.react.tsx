import * as ak from "@ariakit/react";
import { useMergeRefs } from "@ariakit/react-utils";
import * as React from "react";
import { useTruncation } from "../react-utils/use-truncation.react.ts";

export interface TruncatedTextProps extends ak.RoleProps<"span"> {}

/**
 * Renders text that its element can cut off. In the anchor of a `Tooltip`, the
 * tooltip shows only while the text is cut off. It has no styles, so the
 * element that it renders cuts the text off, such as with `truncate`,
 * `line-clamp-*`, or a `$truncate` variant. It can be the anchor itself or text
 * inside it, such as the label of a link.
 * @example
 * <Tooltip text="Design review notes">
 *   <TruncatedText render={<Link href="#notes" className="block truncate" />}>
 *     Design review notes
 *   </TruncatedText>
 * </Tooltip>
 * @example
 * <Tooltip text="Regional operations">
 *   <BreadcrumbLink href="#regional" item={false}>
 *     <TruncatedText render={<BreadcrumbLabel $truncate />}>
 *       Regional operations
 *     </TruncatedText>
 *   </BreadcrumbLink>
 * </Tooltip>
 */
export function TruncatedText({ ref, ...props }: TruncatedTextProps) {
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  const mergedRef = useMergeRefs(setElement, ref);
  useTruncation(element);
  return <ak.Role.span {...props} ref={mergedRef} />;
}
