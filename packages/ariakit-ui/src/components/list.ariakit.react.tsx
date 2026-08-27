import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import {
  list,
  listDisclosure,
  listDisclosureButton,
  listDisclosureContentBody,
  listItem,
  listItemConnector,
  listItemContent,
  listItemMarker,
} from "../styles/list.ts";
import { progressCircularFill } from "../styles/progress.ts";
import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "./disclosure.ariakit.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureContentBody,
} from "./disclosure.ariakit.react.tsx";

export interface ListProps
  extends
    React.ComponentProps<"ol">,
    Omit<VariantProps<typeof list>, "$ordered"> {
  /** Renders an ordered list (<ol>) when true; unordered (<ul>) when false. */
  ordered?: boolean;
}

/**
 * List container that renders an ordered or unordered list with consistent
 * styles.
 * @example
 * <List>
 *   <ListItem>Item</ListItem>
 *   <ListItem progress={0.5}>Item</ListItem>
 *   <ListItem checked>Item</ListItem>
 * </List>
 */
export function List({ ordered, ...props }: ListProps) {
  const Component = ordered ? "ol" : "ul";
  const [variantProps, rest] = splitProps(props, list);
  return (
    <Component
      {...list.jsx({ $ordered: !!ordered, ...variantProps })}
      {...rest}
    />
  );
}

export interface ListItemProps
  extends
    ak.RoleProps<"li">,
    VariantProps<typeof listItem>,
    Pick<ListItemMarkerProps, "checked" | "progress"> {}

/**
 * List item that must be a child of `List`. It renders its own `ListItemMarker`
 * and `ListItemConnector`, which are absolutely positioned in the gutter the
 * item reserves through its start padding, and wraps its children in a
 * `ListItemContent` so the first of them keeps `:first-child` despite the two
 * elements in front of it.
 */
export function ListItem({ checked, progress, ...props }: ListItemProps) {
  const [variantProps, rest] = splitProps(props, listItem);
  return (
    <ak.Role.li {...listItem.jsx(variantProps)} {...rest}>
      <ListItemMarker checked={checked} progress={progress} />
      <ListItemConnector />
      <ListItemContent>{rest.children}</ListItemContent>
    </ak.Role.li>
  );
}

export interface ListItemContentProps
  extends React.ComponentProps<"span">, VariantProps<typeof listItemContent> {}

/**
 * Wrapper for a row's own children. It generates no box, so the children lay
 * out exactly as they would directly in the row, but it keeps the marker and
 * the connector that precede them from taking `:first-child` away from the
 * first of them. Render it as a `span`: the block-mode variants detect block
 * children with `:has(:where(p, div, ...))`, so a `div` would put every list
 * into blocks mode.
 */
export function ListItemContent(props: ListItemContentProps) {
  const [variantProps, rest] = splitProps(props, listItemContent);
  return <span {...listItemContent.jsx(variantProps)} {...rest} />;
}

export interface ListItemMarkerProps
  extends
    React.ComponentProps<"span">,
    Omit<VariantProps<typeof listItemMarker>, "$checked" | "$progress"> {
  /** Progress between `0` and `1` shown as a circular arc. */
  progress?: number;
  /** Whether the check is checked. Defaults to `true` if `progress` is `1`. */
  checked?: boolean;
}

/**
 * Marker rendered in a list item's gutter: a bullet in unordered lists, a
 * numbered chip in ordered ones, and a check slot when `checked` or `progress`
 * is set.
 */
export function ListItemMarker({
  progress,
  checked,
  ...props
}: ListItemMarkerProps) {
  const hasCheck = checked != null || progress != null;
  const completed = progress === 1 || !!checked;
  const [variantProps, rest] = splitProps(props, listItemMarker);
  return (
    <span
      // Bullets and numbers repeat what the list element already conveys, so
      // only the check slot exposes a state.
      aria-hidden={hasCheck ? undefined : true}
      role={hasCheck ? "img" : undefined}
      aria-label={hasCheck ? (completed ? "Checked" : "Unchecked") : undefined}
      {...listItemMarker.jsx({
        $checked: hasCheck ? completed : undefined,
        $progress: completed ? undefined : progress,
        ...variantProps,
      })}
      {...rest}
    >
      {completed ? (
        <CheckIcon />
      ) : progress != null ? (
        <span {...progressCircularFill.jsx({})} />
      ) : null}
      {rest.children}
    </span>
  );
}

export interface ListItemConnectorProps
  extends
    React.ComponentProps<"span">,
    VariantProps<typeof listItemConnector> {}

/**
 * Vertical segment joining a row's marker to the next row's. It only becomes
 * visible in ordered lists that are in blocks mode, where the list gives it a
 * width.
 */
export function ListItemConnector(props: ListItemConnectorProps) {
  const [variantProps, rest] = splitProps(props, listItemConnector);
  return <span {...listItemConnector.jsx(variantProps)} {...rest} />;
}

export interface ListDisclosureProps
  extends DisclosureProps, VariantProps<typeof listDisclosure> {
  button?: React.ReactNode | ListDisclosureButtonProps;
  content?: React.ReactElement | ListDisclosureContentProps;
}

/**
 * Disclosure adapted for lists, integrating with `ListItem` visuals. Like
 * `ListItem`, it belongs to a row of a `List`, so its connector can tell
 * whether that row closes the list.
 * @example
 * <List ordered>
 *   <li>
 *     <ListDisclosure button="Item">Details</ListDisclosure>
 *   </li>
 * </List>
 */
export function ListDisclosure(props: ListDisclosureProps) {
  const [variantProps, rest] = splitProps(props, listDisclosure);
  const button = createRender(ListDisclosureButton, rest.button);
  const content = createRender(ListDisclosureContent, rest.content);
  return (
    <Disclosure
      {...listDisclosure.jsx(variantProps)}
      {...rest}
      // The connector has to span the whole row, open content included, so it
      // goes on the disclosure root instead of on the button. A caller's own
      // decoration keeps its place alongside it.
      decoration={
        <>
          {rest.decoration}
          <ListItemConnector />
        </>
      }
      // A nullish check, not truthiness: falsy labels like {0} must still
      // render through ListDisclosureButton so its indicator defaults apply.
      button={rest.button != null ? button : undefined}
      content={content}
    />
  );
}

export interface ListDisclosureButtonProps
  extends
    DisclosureButtonProps,
    VariantProps<typeof listDisclosureButton>,
    Pick<ListItemMarkerProps, "checked" | "progress"> {}

export function ListDisclosureButton({
  checked,
  progress,
  indicator = "chevron-down-next",
  ...props
}: ListDisclosureButtonProps) {
  const [variantProps, rest] = splitProps(props, listDisclosureButton);
  return (
    <DisclosureButton
      indicator={indicator}
      {...listDisclosureButton.jsx(variantProps)}
      {...rest}
    >
      <ListItemMarker checked={checked} progress={progress} />
      <ListItemContent>{rest.children}</ListItemContent>
    </DisclosureButton>
  );
}

export interface ListDisclosureContentProps extends DisclosureContentProps {}

export function ListDisclosureContent(props: ListDisclosureContentProps) {
  const body = createRender(ListDisclosureContentBody, props.body);
  return <DisclosureContent {...props} body={body} />;
}

export interface ListDisclosureContentBodyProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof listDisclosureContentBody> {}

export function ListDisclosureContentBody(
  props: ListDisclosureContentBodyProps,
) {
  const [variantProps, rest] = splitProps(props, listDisclosureContentBody);
  return (
    <DisclosureContentBody
      {...listDisclosureContentBody.jsx(variantProps)}
      {...rest}
    />
  );
}
