import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  list,
  listItem,
  listItemConnector,
  listItemContent,
  listItemMarker,
} from "../styles/list.ts";
import { progressCircularFill } from "../styles/progress.ts";

// The `$ordered` variant is computed from the `ordered` prop, so it's
// omitted from the public props and must not be part of the split keys.
const listPropKeys = list.html.propKeys.filter((key) => key !== "$ordered");

export interface ListProps
  extends
    ComponentProps<"ol">,
    // The ordered prop computes this variant along with the element, so they
    // stay in sync.
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
export function List(props: ListProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["ordered"],
    listPropKeys,
  );
  return (
    <Dynamic
      component={localProps.ordered ? "ol" : "ul"}
      {...list.html({ $ordered: !!localProps.ordered, ...variantProps })}
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
export function ListItem(props: ListItemProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["children", "checked", "progress"],
    listItem.html.propKeys,
  );
  return (
    <li {...listItem.html(variantProps)} {...rest}>
      <ListItemMarker
        checked={localProps.checked}
        progress={localProps.progress}
      />
      <ListItemConnector />
      <ListItemContent>{localProps.children}</ListItemContent>
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
 * into blocks mode.
 */
export function ListItemContent(props: ListItemContentProps) {
  const [variantProps, rest] = splitProps(props, listItemContent.html.propKeys);
  return <span {...listItemContent.html(variantProps)} {...rest} />;
}

// The `$check`, `$checked` and `$progress` variants are computed from the
// `checked` and `progress` props, so they're omitted from the public props
// and must not be part of the split keys.
const listItemMarkerPropKeys = listItemMarker.html.propKeys.filter(
  (key) => key !== "$check" && key !== "$checked" && key !== "$progress",
);

export interface ListItemMarkerProps
  extends
    ComponentProps<"span">,
    // The checked and progress props compute these variants along with the
    // aria label and the icon or arc children, so they stay in sync.
    Omit<
      VariantProps<typeof listItemMarker>,
      "$check" | "$checked" | "$progress"
    > {
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
export function ListItemMarker(props: ListItemMarkerProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["children", "checked", "progress"],
    listItemMarkerPropKeys,
  );
  // Accessors rather than plain consts so the derived state stays reactive
  // when checked or progress change.
  const hasCheck = () =>
    localProps.checked != null || localProps.progress != null;
  const completed = () => localProps.progress === 1 || !!localProps.checked;
  return (
    <span
      // Bullets and numbers repeat what the list element already conveys, so
      // only the check slot exposes a state.
      aria-hidden={hasCheck() ? undefined : "true"}
      role={hasCheck() ? "img" : undefined}
      aria-label={
        hasCheck() ? (completed() ? "Checked" : "Unchecked") : undefined
      }
      {...listItemMarker.html({
        $checked: hasCheck() ? completed() : undefined,
        $progress: completed() ? undefined : localProps.progress,
        ...variantProps,
      })}
      {...rest}
    >
      <Show
        when={completed()}
        fallback={
          <Show when={localProps.progress != null}>
            <span aria-hidden {...progressCircularFill.html({})} />
          </Show>
        }
      >
        <CheckIcon />
      </Show>
      {localProps.children}
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
  const [variantProps, rest] = splitProps(
    props,
    listItemConnector.html.propKeys,
  );
  return (
    <span
      aria-hidden="true"
      {...listItemConnector.html(variantProps)}
      {...rest}
    />
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}
