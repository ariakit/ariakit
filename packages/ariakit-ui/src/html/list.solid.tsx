import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { list, listItem, listItemCheck } from "../styles/list.ts";
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

// The `$check` variant is computed from the `checked` and `progress` props,
// so it's omitted from the public props and must not be part of the split
// keys.
const listItemPropKeys = listItem.html.propKeys.filter(
  (key) => key !== "$check",
);

export interface ListItemProps
  extends
    ComponentProps<"li">,
    // The checked and progress props compute this variant along with the
    // check child, so they stay in sync.
    Omit<VariantProps<typeof listItem>, "$check">,
    Pick<ListItemCheckProps, "checked" | "progress"> {}

/**
 * List item that must be a child of `List`. Passing `checked` or `progress`
 * renders a `ListItemCheck` marker before the children.
 */
export function ListItem(props: ListItemProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["children", "checked", "progress"],
    listItemPropKeys,
  );
  // Accessor rather than a plain const so the derived state stays reactive
  // when checked or progress change.
  const hasCheck = () =>
    localProps.checked != null || localProps.progress != null;
  return (
    <li {...listItem.html({ $check: hasCheck(), ...variantProps })} {...rest}>
      <Show when={hasCheck()}>
        <ListItemCheck
          checked={localProps.checked}
          progress={localProps.progress}
        />
      </Show>
      {localProps.children}
    </li>
  );
}

// The `$checked` and `$progress` variants are computed from the `checked`
// and `progress` props, so they're omitted from the public props and must
// not be part of the split keys.
const listItemCheckPropKeys = listItemCheck.html.propKeys.filter(
  (key) => key !== "$checked" && key !== "$progress",
);

export interface ListItemCheckProps
  extends
    ComponentProps<"span">,
    // The checked and progress props compute these variants along with the
    // aria label and the icon or arc children, so they stay in sync.
    Omit<VariantProps<typeof listItemCheck>, "$checked" | "$progress"> {
  /** Progress between `0` and `1` shown as a circular arc. */
  progress?: number;
  /** Whether the check is checked. Defaults to `true` if `progress` is `1`. */
  checked?: boolean;
}

/**
 * Check marker showing a checked icon or a circular progress arc. Must live
 * inside a `ListItem`, which renders it when `checked` or `progress` is set.
 */
export function ListItemCheck(props: ListItemCheckProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["children", "checked", "progress"],
    listItemCheckPropKeys,
  );
  // Accessor rather than a plain const so the derived state stays reactive
  // when checked or progress change.
  const completed = () => localProps.progress === 1 || !!localProps.checked;
  return (
    <span
      role="img"
      aria-label={completed() ? "Checked" : "Unchecked"}
      {...listItemCheck.html({
        $checked: completed(),
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
