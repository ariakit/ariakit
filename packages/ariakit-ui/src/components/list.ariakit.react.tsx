import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
  getRenderProps,
  hasContent,
  isRenderable,
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
  listItemMarkerCheck,
} from "../styles/list.ts";
import { progressCircularFill } from "../styles/progress.ts";
import type {
  DisclosureButtonProps,
  DisclosureContentBodyProps,
  DisclosureContentProps,
  DisclosureProps,
} from "./disclosure.ariakit.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureButtonLabel,
  DisclosureContent,
  DisclosureContentBody,
} from "./disclosure.ariakit.react.tsx";

interface ListContextValue {
  /** Whether the rows render the bends that join a branch to its parent. */
  branch: boolean;
  /** The guide of the rows that don't set their own. */
  guide?: ListItemProps["guide"];
  /** The marker of the rows that don't set their own. */
  marker?: ListItemProps["marker"];
  /** The start of the anchor names that join the bends to the stem and tail. */
  anchor?: string;
}

// What a list passes to its rows. A nested list passes its own values.
const ListContext = React.createContext<ListContextValue>({ branch: false });

// Whether the content of a row is around, so a list knows that it is nested.
const ListRowContext = React.createContext(false);

interface GetMarkerEdgePropsParams extends Pick<
  ListItemMarkerProps,
  "checked" | "progress"
> {
  /** The guide of the row, as an element or props. */
  guide?: ListItemProps["guide"];
}

// A plain marker takes the edge color of the guide of its row, so one color
// draws the lane. A check, an empty slot, and progress keep their colors.
function getMarkerEdgeProps({
  guide,
  checked,
  progress,
}: GetMarkerEdgePropsParams) {
  if (checked != null) return;
  if (progress != null) return;
  const props = getRenderProps<ListItemGuideProps>(guide);
  if (props?.$edge == null) return;
  return {
    $edge: props.$edge,
    $edgeRaw: props.$edgeRaw,
    $edgeContrast: props.$edgeContrast,
  };
}

export interface ListProps
  extends
    React.ComponentProps<"ol">,
    Omit<VariantProps<typeof list>, "$ordered"> {
  /**
   * Renders an ordered `ol` when `true`, or an unordered `ul` when `false`.
   * Defaults to `false`.
   */
  ordered?: boolean;
  /**
   * Joins adjacent markers with a guide. Pass `ListItemGuide` props, such as an
   * edge color or a line style, or a custom element, to turn the guide on and
   * style the pieces of all rows. A row can set its own `guide`. `$guide` takes
   * precedence over whether the guide shows. A marker without a check or
   * progress takes the edge color of the guide, unless `marker` sets one.
   */
  guide?: boolean | React.ReactElement | ListItemGuideProps;
  /**
   * Custom marker element or `ListItemMarker` props, such as color variants,
   * for all rows. A row can set its own `marker`.
   */
  marker?: React.ReactElement | ListItemMarkerProps;
}

/**
 * List container that renders an ordered or unordered list with consistent
 * styles. An ordered list numbers its rows and, in blocks mode, joins the
 * numbers with a guide; `$marker` and `$guide` pick both for any list. The
 * native `start` attribute sets the first number. Chrome and Safari keep the
 * old numbers when it changes, so also pass it as `key` if it can change.
 * @example
 * <List>
 *   <ListItem>Item</ListItem>
 *   <ListItem progress={0.5}>Item</ListItem>
 *   <ListItem checked>Item</ListItem>
 * </List>
 * @example
 * <List guide>
 *   <ListItem>A bulleted row on a guide</ListItem>
 *   <ListItem>The next stop</ListItem>
 * </List>
 * @example
 * <List guide={{ $edge: "brand", $line: "dashed" }}>
 *   <ListItem>A row on a dashed guide in the brand color</ListItem>
 *   <ListItem>The next stop</ListItem>
 * </List>
 */
export function List({ ordered, guide, marker, ...props }: ListProps) {
  const Component = ordered ? "ol" : "ul";
  const [variantProps, rest] = splitProps(props, list);
  const nested = React.useContext(ListRowContext);
  const id = React.useId();
  const branch = !!variantProps.$branch;
  const context: ListContextValue = {
    branch,
    guide: typeof guide === "boolean" ? undefined : guide,
    marker,
    // A CSS identifier can't hold the punctuation of a React id.
    anchor:
      branch && nested ? `--list-${id.replace(/[^\w-]/g, "")}` : undefined,
  };
  return (
    <ListContext.Provider value={context}>
      {context.anchor && (
        <>
          {createRender<ListItemGuidePieceProps>(ListItemGuide, context.guide, {
            $piece: "stem",
            $anchor: `${context.anchor}-in`,
          })}
          {createRender<ListItemGuidePieceProps>(ListItemGuide, context.guide, {
            $piece: "tail",
            $anchor: `${context.anchor}-out`,
          })}
        </>
      )}
      <Component
        {...list.jsx({
          $ordered: !!ordered,
          ...variantProps,
          // Guide props and a custom element also turn the guide on.
          $guide: variantProps.$guide ?? (guide == null ? undefined : !!guide),
        })}
        {...rest}
      />
    </ListContext.Provider>
  );
}

export interface ListItemProps
  extends
    ak.RoleProps<"li">,
    // The row sets `$check` from `checked` and `progress`.
    Omit<VariantProps<typeof listItem>, "$check">,
    Pick<ListItemMarkerProps, "checked" | "progress"> {
  /**
   * Icon shown in the marker. Use it in a list with `$marker="icon"`, which
   * draws each marker as a chip. Set `$markerSize` on the list to give the
   * icons more room. On a checked row, the icon replaces the check.
   */
  icon?: React.ReactNode;
  /**
   * Custom marker element or `ListItemMarker` props, such as color variants.
   * The marker still takes `checked`, `progress`, and `icon` from the row.
   * Defaults to the `marker` of the list.
   */
  marker?: React.ReactElement | ListItemMarkerProps;
  /**
   * Custom guide element or `ListItemGuide` props, such as an edge color or a
   * line style, for the pieces of this row. Defaults to the `guide` of the
   * list, which also turns the guide on.
   */
  guide?: React.ReactElement | ListItemGuideProps;
}

/**
 * A row inside `List`. Creates its marker and guide, then wraps its children in
 * `ListItemContent` to preserve their layout and first-child styles.
 * @example
 * <List ordered>
 *   <ListItem checked>Install</ListItem>
 *   <ListItem progress={0.5}>Configure</ListItem>
 * </List>
 * @example
 * <List $marker="icon" $markerSize={8} $guide>
 *   <ListItem icon={<GitCommitIcon />}>Pushed a commit</ListItem>
 *   <ListItem icon={<TagIcon />}>Added a tag</ListItem>
 * </List>
 * @example
 * <List>
 *   <ListItem checked marker={{ $layer: "success" }}>
 *     Tests passed
 *   </ListItem>
 * </List>
 * @example
 * <List guide>
 *   <ListItem guide={{ $line: "dashed" }}>Draft, then a dashed line</ListItem>
 *   <ListItem>Published</ListItem>
 * </List>
 */
export function ListItem({
  checked,
  progress,
  icon,
  marker,
  guide,
  ...props
}: ListItemProps) {
  const [variantProps, rest] = splitProps(props, listItem);
  const context = React.useContext(ListContext);
  const guideProps = guide ?? context.guide;
  return (
    <ak.Role.li
      {...listItem.jsx({
        ...variantProps,
        $check: checked != null || progress != null,
      })}
      {...rest}
    >
      {variantProps.$marker !== false &&
        createRender(ListItemMarker, marker ?? context.marker, {
          ...getMarkerEdgeProps({ guide: guideProps, checked, progress }),
          checked,
          progress,
          children: icon,
        })}
      {createRender(ListItemGuide, guideProps)}
      {context.branch && (
        <>
          {createRender<ListItemGuidePieceProps>(ListItemGuide, guideProps, {
            $piece: "in",
            $anchor: context.anchor && `${context.anchor}-in`,
          })}
          {createRender<ListItemGuidePieceProps>(ListItemGuide, guideProps, {
            $piece: "out",
            $anchor: context.anchor && `${context.anchor}-out`,
          })}
        </>
      )}
      <ListRowContext.Provider value>
        <ListItemContent>{rest.children}</ListItemContent>
      </ListRowContext.Provider>
    </ak.Role.li>
  );
}

export interface ListItemContentProps
  extends React.ComponentProps<"span">, VariantProps<typeof listItemContent> {}

/**
 * Content wrapper created by `ListItem` and `ListDisclosureButton`. It
 * preserves child layout and first-child styles after the marker and guide.
 */
export function ListItemContent(props: ListItemContentProps) {
  const [variantProps, rest] = splitProps(props, listItemContent);
  return <span {...listItemContent.jsx(variantProps)} {...rest} />;
}

export interface ListItemMarkerProps
  extends
    React.ComponentProps<"span">,
    Omit<VariantProps<typeof listItemMarker>, "$checked" | "$progress"> {
  /**
   * Progress from `0` to `1`, shown as a circular arc until checked. Set
   * `"indeterminate"` when the progress is unknown: the arc then spins, or
   * stays in a fixed position with reduced motion. Omit it to use the list's
   * marker or the explicit `checked` state.
   */
  progress?: number | "indeterminate";
  /**
   * Shows a checked or unchecked marker. Defaults to `true` when `progress` is
   * `1`; an explicit value takes precedence over progress completion.
   */
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
  const indeterminate = progress === "indeterminate";
  const [variantProps, rest] = splitProps(props, listItemMarker);
  // Keep progress in the description so the name can convey the check state.
  const getDescription = () => {
    if (completed) return;
    if (progress == null) return;
    if (progress === "indeterminate") return "In progress";
    return `${Math.round(progress * 100)}% complete`;
  };
  const description = getDescription();
  return (
    <span
      {...listItemMarker.jsx({
        $checked: hasCheck ? completed : undefined,
        $progress: completed || indeterminate ? undefined : progress,
        ...variantProps,
      })}
      {...rest}
      // Hide redundant list markers. Only checks expose a state. Apply
      // fallbacks after the spread to handle undefined props.
      aria-hidden={rest["aria-hidden"] ?? (hasCheck ? undefined : true)}
      role={rest.role ?? (hasCheck ? "img" : undefined)}
      aria-label={
        rest["aria-label"] ??
        (hasCheck ? (completed ? "Checked" : "Unchecked") : undefined)
      }
      aria-description={rest["aria-description"] ?? description}
    >
      {/* An icon replaces the check. The check stays in an unchecked marker, so
          it can show with a wipe. */}
      {hasCheck && !hasContent(rest.children) && (
        <span {...listItemMarkerCheck.jsx({ $checked: completed })} />
      )}
      {!completed && progress != null && (
        <span
          data-indeterminate={indeterminate || undefined}
          {...progressCircularFill.jsx()}
        />
      )}
      {rest.children}
    </span>
  );
}

export interface ListItemGuideProps
  extends
    React.ComponentProps<"span">,
    // The list and the list item set which piece each element is, and the
    // anchor that joins two of them.
    Omit<VariantProps<typeof listItemGuide>, "$piece" | "$anchor"> {}

// The props of the pieces that `ListItem` creates.
interface ListItemGuidePieceProps
  extends
    ListItemGuideProps,
    Pick<VariantProps<typeof listItemGuide>, "$piece" | "$anchor"> {}

/**
 * Guide piece created by `ListItem` and `ListDisclosure`. Joins adjacent
 * markers when the list enables its guide. In a list with `$branch`, `ListItem`
 * also creates a piece for each bend, which joins the first row to the parent
 * guide and the last row back to it. `$bend` and `$radius` set the shape of the
 * bends. The `guide` prop of `List` and `ListItem` passes props to the pieces.
 * @example
 * <List guide={<ListItemGuide $edge="success" $line="dotted" />}>
 *   <ListItem>A row on a dotted green guide</ListItem>
 *   <ListItem>The next stop</ListItem>
 * </List>
 * @example
 * <List>
 *   <ListItem>
 *     A row with a branch
 *     <List $branch guide={{ $bend: "diagonal" }}>
 *       <ListItem>A row that slanted lines join to its parent</ListItem>
 *     </List>
 *   </ListItem>
 * </List>
 */
export function ListItemGuide(props: ListItemGuideProps) {
  const [variantProps, rest] = splitProps(props, listItemGuide);
  return <span {...listItemGuide.jsx(variantProps)} {...rest} />;
}

export interface ListDisclosureProps extends Omit<
  DisclosureProps<typeof listDisclosure>,
  "recipe"
> {
  /**
   * Button content, a custom element, or `ListDisclosureButton` props. When
   * omitted, children must include the button and content components.
   */
  button?: React.ReactNode | ListDisclosureButtonProps;
  /**
   * Custom content element or `ListDisclosureContent` props. Used when `button`
   * is set; defaults to content containing the children.
   */
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
 * @example
 * <List ordered>
 *   <li>
 *     <ListDisclosure>
 *       <ListDisclosureButton>Install</ListDisclosureButton>
 *       <ListDisclosureContent>Run the installer.</ListDisclosureContent>
 *     </ListDisclosure>
 *   </li>
 * </List>
 */
export function ListDisclosure({
  button,
  content,
  decoration,
  ...props
}: ListDisclosureProps) {
  const context = React.useContext(ListContext);
  return (
    <Disclosure
      recipe={listDisclosure}
      {...props}
      // The root lets the guide span both the button and open content.
      decoration={
        <>
          {decoration}
          {createRender(ListItemGuide, context.guide)}
        </>
      }
      button={createOptionalRender(ListDisclosureButton, button)}
      content={createRender(ListDisclosureContent, content)}
    />
  );
}

export interface ListDisclosureButtonProps
  // The button sets `$check` from `checked` and `progress`.
  extends
    Omit<
      DisclosureButtonProps<typeof listDisclosureButton>,
      "recipe" | "icon" | "$check"
    >,
    Pick<ListItemMarkerProps, "checked" | "progress">,
    Pick<ListItemProps, "icon" | "marker"> {}

/**
 * Toggles a list disclosure and adds its marker, check state, or progress arc.
 * The indicator defaults to `chevron-down-next`.
 * @example
 * <List ordered>
 *   <li>
 *     <ListDisclosure
 *       button={<ListDisclosureButton checked>Install</ListDisclosureButton>}
 *     >
 *       Installation is complete.
 *     </ListDisclosure>
 *   </li>
 * </List>
 */
export function ListDisclosureButton({
  label,
  checked,
  progress,
  icon,
  marker,
  indicator = "chevron-down-next",
  ...props
}: ListDisclosureButtonProps) {
  const labelProps =
    label === undefined && isRenderable(props.children)
      ? { children: props.children }
      : label;
  const labelEl = createOptionalRender(DisclosureButtonLabel, labelProps);
  const context = React.useContext(ListContext);
  // In a list, the icon goes in the marker, not in a slot before the label.
  const markerEl = createRender(ListItemMarker, marker ?? context.marker, {
    ...getMarkerEdgeProps({ guide: context.guide, checked, progress }),
    checked,
    progress,
    children: icon,
  });
  return (
    <DisclosureButton
      recipe={listDisclosureButton}
      indicator={indicator}
      $check={checked != null || progress != null}
      {...props}
      label={
        labelEl
          ? React.cloneElement(labelEl, {
              children: (
                <>
                  {markerEl}
                  <ListItemContent>{labelEl.props.children}</ListItemContent>
                </>
              ),
            })
          : null
      }
    >
      {!labelEl && markerEl}
      {label !== undefined && props.children}
    </DisclosureButton>
  );
}

export interface ListDisclosureContentProps extends DisclosureContentProps {
  /**
   * Custom body element or `ListDisclosureContentBody` props. Defaults to a
   * `ListDisclosureContentBody` containing the content children.
   */
  body?: React.ReactElement | ListDisclosureContentBodyProps;
}

/**
 * Collapsible content with spacing matched to adjacent list items.
 * @example
 * <List ordered>
 *   <li>
 *     <ListDisclosure
 *       button="Install"
 *       content={<ListDisclosureContent prose />}
 *     >
 *       <p>Run the installer.</p>
 *     </ListDisclosure>
 *   </li>
 * </List>
 */
export function ListDisclosureContent(props: ListDisclosureContentProps) {
  const body = createRender(ListDisclosureContentBody, props.body);
  return <DisclosureContent {...props} body={body} />;
}

export interface ListDisclosureContentBodyProps extends Omit<
  DisclosureContentBodyProps<typeof listDisclosureContentBody>,
  "recipe"
> {}

/**
 * Applies list spacing inside disclosure content. Created by
 * `ListDisclosureContent` unless its `body` prop supplies a replacement.
 * @example
 * <List ordered>
 *   <li>
 *     <ListDisclosure
 *       button="Install"
 *       content={{ body: <ListDisclosureContentBody /> }}
 *     >
 *       Run the installer.
 *     </ListDisclosure>
 *   </li>
 * </List>
 */
export function ListDisclosureContentBody(
  props: ListDisclosureContentBodyProps,
) {
  return (
    <DisclosureContentBody recipe={listDisclosureContentBody} {...props} />
  );
}
