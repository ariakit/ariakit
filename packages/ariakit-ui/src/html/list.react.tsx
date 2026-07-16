import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { list, listItem, listItemCheck } from "../styles/list.ts";
import { progressCircularFill } from "../styles/progress.ts";

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
    // The checked and progress props compute this variant along with the
    // check child, so they stay in sync.
    Omit<VariantProps<typeof listItem>, "$check">,
    Pick<ListItemCheckProps, "checked" | "progress"> {}

/**
 * List item that must be a child of `List`. Passing `checked` or `progress`
 * renders a `ListItemCheck` marker before the children.
 */
export function ListItem({ checked, progress, ...props }: ListItemProps) {
  const hasCheck = checked != null || progress != null;
  const [variantProps, rest] = splitProps(props, listItem);
  return (
    <li {...listItem.jsx({ $check: hasCheck, ...variantProps })} {...rest}>
      {hasCheck && <ListItemCheck checked={checked} progress={progress} />}
      {rest.children}
    </li>
  );
}

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
export function ListItemCheck({
  progress,
  checked,
  ...props
}: ListItemCheckProps) {
  const completed = progress === 1 || !!checked;
  const [variantProps, rest] = splitProps(props, listItemCheck);
  return (
    <span
      role="img"
      aria-label={completed ? "Checked" : "Unchecked"}
      {...listItemCheck.jsx({
        $checked: completed,
        $progress: completed ? undefined : progress,
        ...variantProps,
      })}
      {...rest}
    >
      {completed ? (
        <CheckIcon />
      ) : progress != null ? (
        <span aria-hidden {...progressCircularFill.jsx({})} />
      ) : null}
      {rest.children}
    </span>
  );
}
