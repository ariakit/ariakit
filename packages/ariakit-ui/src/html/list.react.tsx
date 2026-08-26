import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  list,
  listItem,
  listItemConnector,
  listItemContent,
  listItemMarker,
} from "../styles/list.ts";
import { progressCircularFill } from "../styles/progress.ts";

export interface ListProps
  extends ComponentProps<"ol">, Omit<VariantProps<typeof list>, "$ordered"> {
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
    ComponentProps<"li">,
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
    <li {...listItem.jsx(variantProps)} {...rest}>
      <ListItemMarker checked={checked} progress={progress} />
      <ListItemConnector />
      <ListItemContent>{rest.children}</ListItemContent>
    </li>
  );
}

export interface ListItemContentProps
  extends ComponentProps<"span">, VariantProps<typeof listItemContent> {}

/**
 * Wrapper for a row's own children. It generates no box, so the children lay
 * out exactly as they would directly in the row, but it keeps the marker and
 * the connector that precede them from taking `:first-child` away from the
 * first of them. Render it as a `span`: the block-mode variants detect block
 * children with `:has(:where(p, div, ...))`, so a `div` would put every list
 * into blocks mode. The app mirrors this markup in
 * `app/src/components/content-list-item-body.astro` — keep them in sync.
 */
export function ListItemContent(props: ListItemContentProps) {
  const [variantProps, rest] = splitProps(props, listItemContent);
  return <span {...listItemContent.jsx(variantProps)} {...rest} />;
}

export interface ListItemMarkerProps
  extends
    ComponentProps<"span">,
    Omit<
      VariantProps<typeof listItemMarker>,
      "$check" | "$checked" | "$value"
    > {
  /** Progress between `0` and `1` shown as a circular arc. */
  progress?: number;
  /** Whether the check is checked. Defaults to `true` if `progress` is `1`. */
  checked?: boolean;
}

/**
 * Marker rendered in a list item's gutter: a bullet in unordered lists, a
 * numbered chip in ordered ones, and a check slot when `checked` or `progress`
 * is set. The app mirrors this markup in
 * `app/src/components/content-list-item-body.astro` — keep them in sync.
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
        $value: completed ? undefined : progress,
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
  extends ComponentProps<"span">, VariantProps<typeof listItemConnector> {}

/**
 * Vertical segment joining a row's marker to the next row's. It only becomes
 * visible in ordered lists that are in blocks mode, where the list gives it a
 * width.
 */
export function ListItemConnector(props: ListItemConnectorProps) {
  const [variantProps, rest] = splitProps(props, listItemConnector);
  return <span {...listItemConnector.jsx(variantProps)} {...rest} />;
}
