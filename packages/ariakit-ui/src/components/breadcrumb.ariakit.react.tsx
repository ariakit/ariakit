import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import {
  breadcrumb,
  breadcrumbCurrent,
  breadcrumbItem,
  breadcrumbLabel,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbSeparator,
  breadcrumbSlot,
} from "../styles/breadcrumb.ts";
import { isCurrentPage } from "../utils/is-current-page.ts";

export interface BreadcrumbProps
  extends ak.RoleProps<"nav">, VariantProps<typeof breadcrumb> {
  /**
   * The list that holds the steps, as an element or `BreadcrumbList` props.
   * Defaults to a `BreadcrumbList` containing the children.
   */
  list?: React.ReactElement | BreadcrumbListProps;
}

/**
 * A navigation landmark with a trail of steps, from the top level down to the
 * current page. Give it a name with `aria-label` or `aria-labelledby`.
 * @example
 * <Breadcrumb aria-label="Breadcrumb">
 *   <BreadcrumbLink href="/recipes">Recipes</BreadcrumbLink>
 *   <BreadcrumbSeparator />
 *   <BreadcrumbCurrent>Navigation</BreadcrumbCurrent>
 * </Breadcrumb>
 */
export function Breadcrumb({ list, children, ...props }: BreadcrumbProps) {
  const [variantProps, rest] = splitProps(props, breadcrumb);
  return (
    <ak.Role.nav {...breadcrumb.jsx(variantProps)} {...rest}>
      {createRender(BreadcrumbList, list, { children })}
    </ak.Role.nav>
  );
}

export interface BreadcrumbListProps
  extends ak.RoleProps<"ol">, VariantProps<typeof breadcrumbList> {}

/**
 * Renders the ordered list of steps. `Breadcrumb` renders one by default. Use
 * it through the `list` prop to change the list element.
 * @example
 * <Breadcrumb aria-label="Breadcrumb" list={<BreadcrumbList id="trail" />}>
 *   <BreadcrumbCurrent>Home</BreadcrumbCurrent>
 * </Breadcrumb>
 */
export function BreadcrumbList(props: BreadcrumbListProps) {
  const [variantProps, rest] = splitProps(props, breadcrumbList);
  return <ak.Role.ol {...breadcrumbList.jsx(variantProps)} {...rest} />;
}

export interface BreadcrumbItemProps
  extends ak.RoleProps<"li">, VariantProps<typeof breadcrumbItem> {}

/**
 * A list item for a step that composes more than one element, such as a link
 * beside a button. `BreadcrumbLink` and `BreadcrumbCurrent` render one by
 * default, so set `item={false}` on them inside it.
 * @example
 * <BreadcrumbItem>
 *   <BreadcrumbLink href="/projects" item={false}>Projects</BreadcrumbLink>
 *   <Button aria-label="More">...</Button>
 * </BreadcrumbItem>
 */
export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const [variantProps, rest] = splitProps(props, breadcrumbItem);
  return <ak.Role.li {...breadcrumbItem.jsx(variantProps)} {...rest} />;
}

interface BreadcrumbStepProps {
  /**
   * The list item around the step, as an element or `BreadcrumbItem` props. Set
   * `false` inside a `BreadcrumbItem`.
   */
  item?: React.ReactElement | BreadcrumbItemProps | false;
}

function renderStep(
  step: React.ReactElement,
  item: BreadcrumbStepProps["item"],
) {
  if (item === false) {
    return step;
  }
  return createRender(BreadcrumbItem, item, { children: step });
}

export interface BreadcrumbLinkProps
  extends
    ak.RoleProps<"a">,
    VariantProps<typeof breadcrumbLink>,
    BreadcrumbStepProps {
  /**
   * The URL of the current page. A link with a matching `href` gets
   * `aria-current="page"`, for a trail that keeps the current step as a link.
   */
  currentUrl?: string | URL;
}

/**
 * A step that links to a level of the trail, with a list item wrapper.
 * @example
 * <Breadcrumb aria-label="Breadcrumb">
 *   <BreadcrumbLink href="/recipes">Recipes</BreadcrumbLink>
 * </Breadcrumb>
 */
export function BreadcrumbLink({
  currentUrl,
  item,
  ...props
}: BreadcrumbLinkProps) {
  const [variantProps, rest] = splitProps(props, breadcrumbLink);
  const isCurrent = isCurrentPage(currentUrl, rest.href);
  return renderStep(
    <ak.Role.a
      aria-current={isCurrent ? "page" : undefined}
      {...breadcrumbLink.jsx(variantProps)}
      {...rest}
    />,
    item,
  );
}

export interface BreadcrumbCurrentProps
  extends
    ak.RoleProps<"span">,
    VariantProps<typeof breadcrumbCurrent>,
    BreadcrumbStepProps {}

/**
 * The step of the current page, as text with `aria-current="page"` and a list
 * item wrapper. For a trail that keeps the current step as a link, use
 * `BreadcrumbLink` with `currentUrl` or `aria-current`.
 * @example
 * <Breadcrumb aria-label="Breadcrumb">
 *   <BreadcrumbCurrent>Navigation</BreadcrumbCurrent>
 * </Breadcrumb>
 */
export function BreadcrumbCurrent({ item, ...props }: BreadcrumbCurrentProps) {
  const [variantProps, rest] = splitProps(props, breadcrumbCurrent);
  return renderStep(
    <ak.Role.span
      aria-current="page"
      {...breadcrumbCurrent.jsx(variantProps)}
      {...rest}
    />,
    item,
  );
}

export interface BreadcrumbLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof breadcrumbLabel> {}

/**
 * The text of a step. Use it beside a `BreadcrumbSlot`, because the gaps and
 * the slot margins need an element on each side, or to clip the text to one
 * line with `$truncate`. A clipped label stops the row from wrapping, so the
 * other steps stay whole.
 * @example
 * <BreadcrumbLink href="/projects">
 *   <BreadcrumbLabel $truncate>Projects</BreadcrumbLabel>
 * </BreadcrumbLink>
 * @example
 * <BreadcrumbLink href="/projects">
 *   <BreadcrumbSlot><FolderIcon /></BreadcrumbSlot>
 *   <BreadcrumbLabel>Projects</BreadcrumbLabel>
 * </BreadcrumbLink>
 */
export function BreadcrumbLabel(props: BreadcrumbLabelProps) {
  const [variantProps, rest] = splitProps(props, breadcrumbLabel);
  return <ak.Role.span {...breadcrumbLabel.jsx(variantProps)} {...rest} />;
}

export interface BreadcrumbSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof breadcrumbSlot> {}

/**
 * Renders an icon, avatar, or thumbnail in a step. Put the text beside it in a
 * `BreadcrumbLabel`. A step with only a slot needs a name from `aria-label`.
 * @example
 * <BreadcrumbLink href="/" aria-label="Home">
 *   <BreadcrumbSlot><HouseIcon /></BreadcrumbSlot>
 * </BreadcrumbLink>
 * @example
 * <BreadcrumbLink href="/projects">
 *   <BreadcrumbSlot><FolderIcon /></BreadcrumbSlot>
 *   <BreadcrumbLabel>Projects</BreadcrumbLabel>
 * </BreadcrumbLink>
 */
export function BreadcrumbSlot(props: BreadcrumbSlotProps) {
  const [variantProps, rest] = splitProps(props, breadcrumbSlot);
  return <ak.Role.span {...breadcrumbSlot.jsx(variantProps)} {...rest} />;
}

export interface BreadcrumbSeparatorProps
  extends ak.RoleProps<"li">, VariantProps<typeof breadcrumbSeparator> {}

/**
 * A hidden list item with the mark between two steps. Set `$kind` to change the
 * mark, or `$kind="none"` to show custom content from the children. It hides
 * beside a control that paints a surface on hover or keyboard focus when the
 * gap leaves too little room. Set `$shy` to change this.
 * @example
 * <Breadcrumb aria-label="Breadcrumb">
 *   <BreadcrumbLink href="/recipes">Recipes</BreadcrumbLink>
 *   <BreadcrumbSeparator $kind="chevron" />
 *   <BreadcrumbCurrent>Navigation</BreadcrumbCurrent>
 * </Breadcrumb>
 */
export function BreadcrumbSeparator(props: BreadcrumbSeparatorProps) {
  const [variantProps, rest] = splitProps(props, breadcrumbSeparator);
  return (
    <ak.Role.li
      aria-hidden
      {...breadcrumbSeparator.jsx(variantProps)}
      {...rest}
    />
  );
}
