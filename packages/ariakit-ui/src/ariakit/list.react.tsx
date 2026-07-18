import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.ts";
import {
  list,
  listDisclosure,
  listDisclosureButton,
  listDisclosureContentBody,
  listItem,
  listItemCheck,
} from "../styles/list.ts";
import { progressCircularFill } from "../styles/progress.ts";
import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "./disclosure.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureContentBody,
} from "./disclosure.react.tsx";

export interface ListProps
  extends
    React.ComponentProps<"ol">,
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
    ak.RoleProps<"li">,
    // The checked and progress props compute this variant along with the
    // check child, so they stay in sync.
    Omit<VariantProps<typeof listItem>, "$check">,
    Pick<ListItemCheckProps, "checked" | "progress"> {}

export function ListItem({ checked, progress, ...props }: ListItemProps) {
  const hasCheck = checked != null || progress != null;
  const [variantProps, rest] = splitProps(props, listItem);
  return (
    <ak.Role.li
      {...listItem.jsx({ $check: hasCheck, ...variantProps })}
      {...rest}
    >
      {hasCheck && <ListItemCheck checked={checked} progress={progress} />}
      {rest.children}
    </ak.Role.li>
  );
}

export interface ListItemCheckProps
  extends
    React.ComponentProps<"span">,
    // The checked and progress props compute these variants along with the
    // aria label and the icon or arc children, so they stay in sync.
    Omit<VariantProps<typeof listItemCheck>, "$checked" | "$progress"> {
  /** Progress between `0` and `1` shown as a circular arc. */
  progress?: number;
  /** Whether the check is checked. Defaults to `true` if `progress` is `1`. */
  checked?: boolean;
}

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

export interface ListDisclosureProps
  extends DisclosureProps, VariantProps<typeof listDisclosure> {
  button?: React.ReactNode | ListDisclosureButtonProps;
  content?: React.ReactElement | ListDisclosureContentProps;
}

/**
 * Disclosure adapted for lists, integrating with `ListItem` visuals.
 * @example
 * <ListDisclosure button="Item">
 *   Details
 * </ListDisclosure>
 */
export function ListDisclosure(props: ListDisclosureProps) {
  const [variantProps, rest] = splitProps(props, listDisclosure);
  const button = createRender(ListDisclosureButton, rest.button);
  const content = createRender(ListDisclosureContent, rest.content);
  return (
    <Disclosure
      {...listDisclosure.jsx(variantProps)}
      {...rest}
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
    // The checked and progress props compute this variant along with the
    // check child, so they stay in sync.
    Omit<VariantProps<typeof listDisclosureButton>, "$check">,
    Pick<ListItemCheckProps, "checked" | "progress"> {}

export function ListDisclosureButton({
  checked,
  progress,
  indicator = "chevron-down-next",
  ...props
}: ListDisclosureButtonProps) {
  const hasCheck = checked != null || progress != null;
  const [variantProps, rest] = splitProps(props, listDisclosureButton);
  return (
    <DisclosureButton
      indicator={indicator}
      {...listDisclosureButton.jsx({ $check: hasCheck, ...variantProps })}
      {...rest}
    >
      {hasCheck && <ListItemCheck checked={checked} progress={progress} />}
      {rest.children}
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
