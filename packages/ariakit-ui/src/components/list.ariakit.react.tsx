import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { CheckIcon } from "lucide-react";
import type * as React from "react";
import {
  createOptionalRender,
  createRender,
} from "../react-utils/create-render.react.ts";
import {
  list,
  listDisclosure,
  listDisclosureButton,
  listDisclosureContentBody,
  listItem,
  listItemGuide,
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
 * styles. An ordered list numbers its rows and, in blocks mode, joins the
 * numbers with a guide; `$marker` and `$guide` pick both for any list.
 * @example
 * <List>
 *   <ListItem>Item</ListItem>
 *   <ListItem progress={0.5}>Item</ListItem>
 *   <ListItem checked>Item</ListItem>
 * </List>
 * @example
 * <List $guide>
 *   <ListItem>A bulleted row on a guide</ListItem>
 *   <ListItem>The next stop</ListItem>
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
 * and `ListItemGuide`, which are absolutely positioned in the gutter the item
 * reserves through its start padding, and wraps its children in a
 * `ListItemContent` so the first of them keeps `:first-child` despite the two
 * elements in front of it.
 */
export function ListItem({ checked, progress, ...props }: ListItemProps) {
  const [variantProps, rest] = splitProps(props, listItem);
  return (
    <ak.Role.li {...listItem.jsx(variantProps)} {...rest}>
      <ListItemMarker checked={checked} progress={progress} />
      <ListItemGuide />
      <ListItemContent>{rest.children}</ListItemContent>
    </ak.Role.li>
  );
}

export interface ListItemContentProps
  extends React.ComponentProps<"span">, VariantProps<typeof listItemContent> {}

/**
 * Wrapper for a row's own children. It generates no box, so the children lay
 * out exactly as they would directly in the row, but it keeps the marker and
 * the guide that precede them from taking `:first-child` away from the first of
 * them. Render it as a `span`: the block-mode variants detect block children
 * with `:has(:where(p, div, ...))`, so a `div` would put every list into blocks
 * mode.
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
 * Marker rendered in a list item's gutter: a dash or a bullet in unordered
 * lists, a numbered chip in ordered ones, and a check slot when `checked` or
 * `progress` is set. The list's `$marker` picks the shape.
 *
 * The marker is absolutely positioned. Outside a list, for example as a status
 * icon, it fills the positioned box one line tall that holds it.
 * @example
 * <span className="relative inline-block size-[1lh]">
 *   <ListItemMarker progress={0.5} />
 * </span>
 */
export function ListItemMarker({
  progress,
  checked,
  ...props
}: ListItemMarkerProps) {
  const hasCheck = checked != null || progress != null;
  const completed = checked ?? progress === 1;
  const [variantProps, rest] = splitProps(props, listItemMarker);
  // The arc shows how far along an unfinished row is. The name keeps the check
  // state, and the description says the value the arc draws.
  const description =
    !completed && progress != null
      ? `${Math.round(progress * 100)}% complete`
      : undefined;
  return (
    <span
      {...listItemMarker.jsx({
        $checked: hasCheck ? completed : undefined,
        $progress: completed ? undefined : progress,
        ...variantProps,
      })}
      {...rest}
      // Set after the spread, so a prop that is present but undefined, as a
      // wrapper with an optional label passes it, keeps the fallback. Bullets
      // and numbers repeat what the list element already conveys, so only the
      // check slot exposes a state.
      aria-hidden={rest["aria-hidden"] ?? (hasCheck ? undefined : true)}
      role={rest.role ?? (hasCheck ? "img" : undefined)}
      aria-label={
        rest["aria-label"] ??
        (hasCheck ? (completed ? "Checked" : "Unchecked") : undefined)
      }
      aria-description={rest["aria-description"] ?? description}
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

export interface ListItemGuideProps
  extends React.ComponentProps<"span">, VariantProps<typeof listItemGuide> {}

/**
 * Vertical segment of the guide, joining a row's marker to the next row's. It
 * only becomes visible where the list draws guides: by default in ordered lists
 * in blocks mode, or wherever the list's `$guide` asks for it.
 */
export function ListItemGuide(props: ListItemGuideProps) {
  const [variantProps, rest] = splitProps(props, listItemGuide);
  return <span {...listItemGuide.jsx(variantProps)} {...rest} />;
}

export interface ListDisclosureProps
  extends DisclosureProps, VariantProps<typeof listDisclosure> {
  button?: React.ReactNode | ListDisclosureButtonProps;
  content?: React.ReactElement | ListDisclosureContentProps;
}

/**
 * Disclosure adapted for lists, integrating with `ListItem` visuals. Like
 * `ListItem`, it belongs to a row of a `List`, so its guide can tell whether
 * that row closes the list.
 * @example
 * <List ordered>
 *   <li>
 *     <ListDisclosure button="Item">Details</ListDisclosure>
 *   </li>
 * </List>
 */
export function ListDisclosure(props: ListDisclosureProps) {
  const [variantProps, rest] = splitProps(props, listDisclosure);
  const button = createOptionalRender(ListDisclosureButton, rest.button);
  const content = createRender(ListDisclosureContent, rest.content);
  return (
    <Disclosure
      {...listDisclosure.jsx(variantProps)}
      {...rest}
      // The guide has to span the whole row, open content included, so it goes
      // on the disclosure root instead of on the button. A caller's own
      // decoration keeps its place alongside it.
      decoration={
        <>
          {rest.decoration}
          <ListItemGuide />
        </>
      }
      button={button}
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
