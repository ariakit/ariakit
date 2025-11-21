import * as ak from "@ariakit/react";
import clsx from "clsx";
import type * as React from "react";
import { createRender } from "#app/examples/_lib/react-utils/create-render.ts";
import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "./disclosure.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "./disclosure.react.tsx";

export interface ListProps extends React.ComponentProps<"ol"> {
  /** Renders an ordered list (<ol>) when true; unordered (<ul>) when false. */
  ordered?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
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
export function List({ ordered, baseClassName, ...props }: ListProps) {
  const Component = ordered ? "ol" : "ul";
  return (
    <Component
      {...props}
      className={clsx(
        baseClassName || ["ak-list", ordered ? "ak-list-ol" : "ak-list-ul"],
        "ak-list-gap-4 ak-list-leading-relaxed",
        props.className,
      )}
    />
  );
}

export interface ListItemProps
  extends ak.RoleProps<"li">,
    Pick<ListItemCheckProps, "checked" | "progress"> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function ListItem({
  checked,
  progress,
  baseClassName,
  ...props
}: ListItemProps) {
  const hasCheck = checked != null || progress != null;
  return (
    <ak.Role.li
      {...props}
      className={clsx(baseClassName || "ak-list-item", props.className)}
    >
      {hasCheck && <ListItemCheck checked={checked} progress={progress} />}
      {props.children}
    </ak.Role.li>
  );
}

export interface ListItemCheckProps extends React.ComponentProps<"span"> {
  /** Progress percentage for the check. */
  progress?: number;
  /** Whether the check is checked. Defaults to `true` if `progress` is `1`. */
  checked?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
}

export function ListItemCheck({
  progress,
  checked,
  baseClassName,
  ...props
}: ListItemCheckProps) {
  const completed = progress === 1 || checked;
  return (
    <span
      {...props}
      style={{ "--progress": progress } as React.CSSProperties}
      className={clsx(
        baseClassName || "ak-list-item-check",
        props.className,
        completed
          ? "ak-list-item-check_checked"
          : progress != null
            ? "ak-list-item-check-progress-(--progress)"
            : "",
      )}
    />
  );
}

export interface ListDisclosureProps extends DisclosureProps {
  button?: React.ReactNode | ListDisclosureButtonProps;
  content?: React.ReactElement | ListDisclosureContentProps;
}

/**
 * Disclosure adapted for lists, integrating with `ListItem` visuals.
 * @example
 * <ListDisclosure>
 *   <ListDisclosureButton>Item</ListDisclosureButton>
 *   <ListDisclosureContent>Details</ListDisclosureContent>
 * </ListDisclosure>
 * @example
 * <ListDisclosure button="Item">
 *   Details
 * </ListDisclosure>
 */
export function ListDisclosure(props: ListDisclosureProps) {
  const button = createRender(ListDisclosureButton, props.button);
  const content = createRender(ListDisclosureContent, props.content);
  return (
    <Disclosure
      baseClassName="ak-list-disclosure"
      {...props}
      button={props.button && button}
      content={content}
    />
  );
}

export interface ListDisclosureButtonProps
  extends DisclosureButtonProps,
    Pick<ListItemProps, "checked" | "progress"> {}

export function ListDisclosureButton({
  checked,
  progress,
  ...props
}: ListDisclosureButtonProps) {
  return (
    <ak.Role.button
      {...props}
      render={
        <ListItem
          checked={checked}
          progress={progress}
          render={
            <DisclosureButton
              baseClassName="ak-list-disclosure-button"
              render={props.render}
            />
          }
        />
      }
    />
  );
}

export interface ListDisclosureContentProps extends DisclosureContentProps {}

export function ListDisclosureContent(props: ListDisclosureContentProps) {
  return (
    <DisclosureContent baseClassName="ak-list-disclosure-content" {...props} />
  );
}
