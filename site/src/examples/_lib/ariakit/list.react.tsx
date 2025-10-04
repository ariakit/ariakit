import * as ak from "@ariakit/react";
import clsx from "clsx";
import type * as React from "react";
import { createRender } from "#app/examples/_lib/react/utils.ts";
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
  return (
    <Component
      {...props}
      className={clsx(
        "ak-list ak-list-gap-4 ak-list-leading-relaxed",
        ordered ? "ak-list-ol" : "ak-list-ul",
        props.className,
      )}
    />
  );
}

export interface ListItemProps
  extends ak.RoleProps<"li">,
    Pick<ListItemCheckProps, "checked" | "progress"> {}

export function ListItem({ checked, progress, ...props }: ListItemProps) {
  const hasCheck = checked != null || progress != null;
  return (
    <ak.Role.li {...props} className={clsx("ak-list-item", props.className)}>
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
}

export function ListItemCheck({
  progress,
  checked,
  ...props
}: ListItemCheckProps) {
  const completed = progress === 1 || checked;
  return (
    <span
      {...props}
      style={{ "--progress": progress } as React.CSSProperties}
      className={clsx(
        props.className,
        "ak-list-item-check",
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
  const buttonEl = createRender(ListDisclosureButton, props.button);
  const contentEl = createRender(ListDisclosureContent, props.content);
  return (
    <Disclosure
      {...props}
      className={clsx("ak-list-disclosure", props.className)}
      button={props.button && buttonEl}
      content={props.content && contentEl}
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
      className={clsx("ak-list-disclosure-button", props.className)}
      render={
        <ListItem
          checked={checked}
          progress={progress}
          render={<DisclosureButton render={props.render} />}
        />
      }
    />
  );
}

export interface ListDisclosureContentProps extends DisclosureContentProps {}

export function ListDisclosureContent(props: ListDisclosureContentProps) {
  return (
    <DisclosureContent
      {...props}
      className={clsx("ak-list-disclosure-content", props.className)}
    />
  );
}
