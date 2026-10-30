import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  appendOptionalChild,
  createOptionalRender,
  createRender,
  isRenderable,
} from "../react-utils/create-render.react.ts";
import {
  LandmarkContext,
  useNestedLandmarks,
} from "../react-utils/landmark.react.ts";
import {
  DescriptionContext,
  useDescription,
  useDescriptionRegistry,
} from "../react-utils/use-description.react.ts";
import {
  nav,
  navButton,
  navButtonContent,
  navDisclosure,
  navDisclosureButton,
  navDisclosureContentBody,
  navDisclosureGroup,
  navGroup,
  navGroupLabel,
  navLink,
  navLinkBar,
  navLinkContent,
  navLinkDescription,
  navLinkLabel,
  navList,
  navSlot,
} from "../styles/nav.ts";
import { wrapsSlotChildren } from "../styles/slot-frame.ts";
import { isCurrentPage } from "../utils/is-current-page.ts";
import type { ButtonProps } from "./button.ariakit.react.tsx";
import { Button } from "./button.ariakit.react.tsx";
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

// Keep ancestors outermost first so current links can open every parent.
const NavDisclosureContext = React.createContext<readonly ak.DisclosureStore[]>(
  [],
);

/** A bar element, `NavLinkBar` props, or `true` for the default bar. */
export type NavLinkBarValue = boolean | React.ReactElement | NavLinkBarProps;

// Lets links inherit the navigation's default bar.
const NavBarContext = React.createContext<NavLinkBarValue | undefined>(
  undefined,
);

export interface NavProps
  extends ak.RoleProps<"nav">, VariantProps<typeof nav> {
  /**
   * The list that holds the rows, as an element or `NavList` props. Defaults to
   * a `NavList` containing the children. Set `false` for groups that supply
   * their own lists. Links with default items need a `NavList` or another `ul`,
   * `ol`, or `menu`; use `item={false}` for standalone links.
   */
  list?: React.ReactElement | NavListProps | false;
  /**
   * Default bar for the current link, including links in groups and
   * disclosures. Set `true` for the default `NavLinkBar`, or supply an element
   * or props. A link's own `bar` prop overrides it. Omitted by default.
   */
  bar?: NavLinkBarValue;
  /**
   * Whether the navigation renders a `nav` landmark. When omitted, it does
   * unless an ancestor `Nav` or a `ShellSidebar` with `landmark="nav"` already
   * renders one, in which case it renders a `div`. A name from `aria-label` or
   * `aria-labelledby` keeps the landmark. Set `false` where that ancestor is
   * outside this React tree, such as in an Astro island, or for rows that are
   * not navigation. A `Nav` set to `false` doesn't count as an ancestor
   * landmark, so a nested `Nav` without a name needs `false` too.
   */
  landmark?: boolean;
}

/**
 * A navigation landmark that wraps its rows in a `NavList` by default. Inside a
 * `Nav` landmark or a `ShellSidebar` with `landmark="nav"`, it renders the rows
 * without a second landmark unless it has a name.
 * @example
 * <Nav aria-label="Main" bar>
 *   <NavLink href="/" currentUrl="/">Home</NavLink>
 *   <NavLink href="/docs">Docs</NavLink>
 * </Nav>
 * @example
 * <Nav aria-label="Docs" list={false}>
 *   <NavGroup>
 *     <NavGroupLabel>Getting started</NavGroupLabel>
 *     <NavList><NavLink href="/install">Install</NavLink></NavList>
 *   </NavGroup>
 * </Nav>
 */
export function Nav({ list, bar, landmark, children, ...props }: NavProps) {
  const [variantProps, rest] = splitProps(props, nav);
  // Each navigation names its bar by default, so view transitions can move it
  // between links. React 18 ids contain colons, which CSS names can't hold.
  const id = React.useId().replace(/[^\w-]/g, "");
  const $barTransitionName = variantProps.$barTransitionName ?? `nav-bar-${id}`;
  const landmarks = React.useContext(LandmarkContext);
  const named = rest["aria-label"] != null || rest["aria-labelledby"] != null;
  const isLandmark = landmark ?? (!landmarks.navigation || named);
  const nestedLandmarks = useNestedLandmarks(landmarks, {
    navigation: isLandmark,
  });
  return (
    <LandmarkContext.Provider value={nestedLandmarks}>
      <NavBarContext.Provider value={bar}>
        <ak.Role.nav
          // A render prop from the caller still decides the element.
          render={isLandmark ? undefined : <div />}
          {...nav.jsx({ ...variantProps, $barTransitionName })}
          {...rest}
        >
          {list === false
            ? children
            : createRender(NavList, list, { children })}
        </ak.Role.nav>
      </NavBarContext.Provider>
    </LandmarkContext.Provider>
  );
}

export interface NavListProps
  extends ak.RoleProps<"ul">, VariantProps<typeof navList> {}

/**
 * A semantic list for navigation rows. `Nav` creates one by default; use
 * additional lists inside groups and disclosures.
 * @example
 * <Nav aria-label="Main" list={<NavList />}>
 *   <NavLink href="/">Home</NavLink>
 * </Nav>
 */
export function NavList(props: NavListProps) {
  const [variantProps, rest] = splitProps(props, navList);
  return <ak.Role.ul {...navList.jsx(variantProps)} {...rest} />;
}

export interface NavLinkBarProps
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkBar> {}

/**
 * A thin bar that marks the current link. Pass it, or its props, to the `bar`
 * prop of `Nav` or `NavLink` so it renders as the link's last child.
 * @example
 * <Nav aria-label="Main" bar={<NavLinkBar $offset="halfway" />}>
 *   <NavLink href="/" currentUrl="/">Home</NavLink>
 *   <NavLink href="/docs">Docs</NavLink>
 * </Nav>
 */
export function NavLinkBar(props: NavLinkBarProps) {
  const [variantProps, rest] = splitProps(props, navLinkBar);
  return (
    <ak.Role.span aria-hidden {...navLinkBar.jsx(variantProps)} {...rest} />
  );
}

export interface NavLinkProps
  extends ak.RoleProps<"a">, VariantProps<typeof navLink> {
  /**
   * Current page URL, compared with `href` to set `aria-current="page"` and
   * open ancestor disclosures. Matches the origin and path, ignoring trailing
   * slashes. A hash or query in `href` must also match. No match is computed
   * when omitted.
   */
  currentUrl?: string | URL;
  /**
   * Custom list item element or props around the link. Defaults to an `li`; set
   * `false` for a standalone link or an existing item wrapper. All other props,
   * including `ref` and `render`, belong to the anchor. The default item needs
   * a `NavList` or another `ul`, `ol`, or `menu` parent.
   */
  item?: React.ReactElement | ak.RoleProps<"li"> | false;
  /**
   * A bar that marks the link while current, as `true`, an element, or
   * `NavLinkBar` props. Rendered after the children. Defaults to the `bar` prop
   * of the parent `Nav`; set `false` to omit it. Children of a `render` element
   * replace it, so pass them to the link instead.
   */
  bar?: NavLinkBarValue;
  /**
   * The link text, rendered in a `NavLinkLabel` with the same `text` when
   * `children` is omitted, so a current link in a horizontal navigation turns
   * heavier without moving the links after it. Ignored when `children` is set;
   * pass `text` to the `NavLinkLabel` among the children instead.
   */
  text?: string;
}

/**
 * A navigation link with a list item wrapper. Pass `currentUrl` to mark the
 * current page and open its ancestor disclosures.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink href="/docs" currentUrl="/docs">Docs</NavLink>
 * </Nav>
 * @example
 * <Nav aria-label="Main" list={false}>
 *   <NavLink href="/docs" item={false}>Docs</NavLink>
 * </Nav>
 * @example
 * <Nav aria-label="Main" $layout="horizontal">
 *   <NavLink href="/docs" aria-current="page" text="Docs" />
 * </Nav>
 */
export function NavLink({
  currentUrl,
  item,
  bar,
  text,
  ...props
}: NavLinkProps) {
  const [variantProps, rest] = splitProps(props, navLink);
  const defaultBar = React.useContext(NavBarContext);
  const barValue = bar ?? defaultBar;
  const barElement = createOptionalRender(
    NavLinkBar,
    barValue === true ? {} : barValue,
  );
  const children =
    rest.children ?? (text == null ? undefined : <NavLinkLabel text={text} />);
  const isCurrent = isCurrentPage(currentUrl, rest.href);
  const disclosures = React.useContext(NavDisclosureContext);
  const { descriptionId, context } = useDescriptionRegistry();
  // A caller description replaces the automatic one, so the description text
  // must stay in the link's name.
  const describes = rest["aria-describedby"] == null;

  React.useEffect(() => {
    if (!isCurrent) return;
    for (const disclosure of disclosures) {
      disclosure.show();
    }
  }, [isCurrent, disclosures]);

  const link = (
    <DescriptionContext.Provider value={describes ? context : null}>
      <ak.Role.a
        aria-current={isCurrent ? "page" : undefined}
        {...navLink.jsx(variantProps)}
        {...rest}
        // An explicit undefined from the caller must not drop the description.
        aria-describedby={rest["aria-describedby"] ?? descriptionId}
      >
        {appendOptionalChild(children, barElement)}
      </ak.Role.a>
    </DescriptionContext.Provider>
  );
  if (item === false) return link;
  return createRender(ak.Role.li, item, { children: link });
}

export interface NavSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof navSlot> {}

/**
 * Renders an icon, badge, avatar, shortcut, thumbnail, or short text in a nav
 * row. All except thumbnails and text inherit the nav's `$slotSize`. A badge
 * after the label takes the line height and fits its text; use `$p="md"` to
 * keep a count of one or two digits round. A badge before the label keeps the
 * icon size. Badge content gets a span for text sizing. Put keyboard keys in a
 * `Kbd`: plain keys in a `text` slot, and flat keys or keycaps in a slot with
 * `$square={false}`.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink href="/updates">
 *     <NavLinkLabel>Updates</NavLinkLabel>
 *     <NavSlot $kind="badge" $p="md">3</NavSlot>
 *   </NavLink>
 * </Nav>
 */
export function NavSlot(props: NavSlotProps) {
  const [variantProps, rest] = splitProps(props, navSlot);
  const variants = navSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...navSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface NavLinkContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkContent> {}

/**
 * Wraps the `NavLinkLabel` and `NavLinkDescription` of a `NavLink` and fills
 * the row, so a slot after it sits at the end.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink href="/docs">
 *     <NavLinkContent>
 *       <NavLinkLabel>Docs</NavLinkLabel>
 *       <NavLinkDescription>Guides and examples</NavLinkDescription>
 *     </NavLinkContent>
 *   </NavLink>
 * </Nav>
 */
export function NavLinkContent(props: NavLinkContentProps) {
  const [variantProps, rest] = splitProps(props, navLinkContent);
  return <ak.Role.span {...navLinkContent.jsx(variantProps)} {...rest} />;
}

export interface NavLinkLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkLabel> {
  /**
   * The label text, rendered when `children` is omitted. A horizontal
   * navigation shows the label of a current link in a heavier weight only when
   * this is set, because the text reserves the heavier width in advance and
   * keeps the row size. Keep it equal to the visible text of custom `children`.
   */
  text?: string;
}

/**
 * Wraps a link's label so adjacent slots can set its margins. Required when a
 * slot follows the text or uses a named `$size`, such as `xl`.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink href="/updates">
 *     <NavLinkLabel>Updates</NavLinkLabel>
 *     <NavSlot $kind="badge" $p="md">3</NavSlot>
 *   </NavLink>
 * </Nav>
 * @example
 * <Nav aria-label="Repository" $layout="horizontal">
 *   <NavLink href="/issues" aria-current="page">
 *     <NavLinkLabel text="Issues" />
 *   </NavLink>
 * </Nav>
 */
export function NavLinkLabel({
  text,
  children = text,
  ...props
}: NavLinkLabelProps) {
  const [variantProps, rest] = splitProps(props, navLinkLabel);
  return (
    <ak.Role.span
      data-text={text}
      {...navLinkLabel.jsx(variantProps)}
      {...rest}
    >
      {children}
    </ak.Role.span>
  );
}

export interface NavLinkDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkDescription> {}

/**
 * Renders secondary text under the `NavLinkLabel` of a `NavLink`. The link
 * takes it as its accessible description, so the rest of the link's content,
 * such as the label and a badge, forms its name. A link takes one description;
 * put more secondary text in the same description. A description with its own
 * `id` describes the link only after hydration. Pass `aria-describedby` to the
 * link to describe it with other text; the description then stays in the name.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink href="/docs">
 *     <NavLinkContent>
 *       <NavLinkLabel>Docs</NavLinkLabel>
 *       <NavLinkDescription>Guides and examples</NavLinkDescription>
 *     </NavLinkContent>
 *   </NavLink>
 * </Nav>
 */
export function NavLinkDescription(props: NavLinkDescriptionProps) {
  const [variantProps, rest] = splitProps(props, navLinkDescription);
  const { id, describes } = useDescription(rest.id);
  // A hidden element still describes the link that references it. Hiding it
  // keeps the text out of the link's name, which comes from its content.
  return (
    <ak.Role.span
      aria-hidden={describes || undefined}
      {...navLinkDescription.jsx(variantProps)}
      {...rest}
      id={id}
    />
  );
}

export interface NavGroupProps
  extends ak.GroupProps, VariantProps<typeof navGroup> {}

/**
 * Groups related navigation rows under an optional `NavGroupLabel`. Put its
 * links in a `NavList`.
 * @example
 * <Nav aria-label="Docs" list={false}>
 *   <NavGroup>
 *     <NavGroupLabel>Getting started</NavGroupLabel>
 *     <NavList><NavLink href="/install">Install</NavLink></NavList>
 *   </NavGroup>
 * </Nav>
 */
export function NavGroup(props: NavGroupProps) {
  const [variantProps, rest] = splitProps(props, navGroup);
  return <ak.Group {...navGroup.jsx(variantProps)} {...rest} />;
}

export interface NavGroupLabelProps
  extends ak.GroupLabelProps, VariantProps<typeof navGroupLabel> {}

/**
 * Renders the label of a nav group, padded like a row and with its text
 * starting where the rows' content starts.
 * @example
 * <Nav aria-label="Docs" list={false}>
 *   <NavGroup>
 *     <NavGroupLabel>Getting started</NavGroupLabel>
 *     <NavList><NavLink href="/install">Install</NavLink></NavList>
 *   </NavGroup>
 * </Nav>
 */
export function NavGroupLabel(props: NavGroupLabelProps) {
  const [variantProps, rest] = splitProps(props, navGroupLabel);
  return <ak.GroupLabel {...navGroupLabel.jsx(variantProps)} {...rest} />;
}

export interface NavDisclosureGroupProps
  extends ak.RoleProps<"ul">, VariantProps<typeof navDisclosureGroup> {}

/**
 * A list of `NavDisclosure` sections in a shared frame with dividers between
 * them. It spans the nav's padding. Set `$fill` on it and on the `Nav` to grow
 * the open section into the height of a sidebar.
 * @example
 * <Nav aria-label="Docs" list={false}>
 *   <NavDisclosureGroup>
 *     <NavDisclosure button="Guides">
 *       <NavList><NavLink href="/install">Install</NavLink></NavList>
 *     </NavDisclosure>
 *     <NavDisclosure button="Components">
 *       <NavList><NavLink href="/button">Button</NavLink></NavList>
 *     </NavDisclosure>
 *   </NavDisclosureGroup>
 * </Nav>
 */
export function NavDisclosureGroup(props: NavDisclosureGroupProps) {
  const [variantProps, rest] = splitProps(props, navDisclosureGroup);
  return <ak.Role.ul {...navDisclosureGroup.jsx(variantProps)} {...rest} />;
}

// $slotSize sizes both the disclosure icon and its nested nav slots.
export interface NavDisclosureProps extends Omit<
  DisclosureProps<typeof navDisclosure>,
  "recipe" | "$iconSize"
> {
  /**
   * Button content, a custom element, or `NavDisclosureButton` props. When
   * omitted, children must include the button and content components.
   */
  button?: React.ReactNode | NavDisclosureButtonProps;
  /**
   * Custom content element or `NavDisclosureContent` props. Used when `button`
   * is set; defaults to content containing the children.
   */
  content?: React.ReactElement | NavDisclosureContentProps;
}

function NavDisclosureRoot(props: ak.RoleProps<"li">) {
  // Capture the store before nested providers replace the shared context.
  const disclosure = ak.useDisclosureContext();
  const ancestors = React.useContext(NavDisclosureContext);
  const disclosures = React.useMemo(() => {
    if (!disclosure) return ancestors;
    return [...ancestors, disclosure];
  }, [ancestors, disclosure]);
  return (
    <NavDisclosureContext.Provider value={disclosures}>
      <ak.Role.li {...props} />
    </NavDisclosureContext.Provider>
  );
}

/**
 * Discloses nested nav rows. The transparent root keeps the nav surface
 * visible.
 * @example
 * <Nav aria-label="Docs">
 *   <NavDisclosure button="Getting started">
 *     <NavList><NavLink href="/install">Install</NavLink></NavList>
 *   </NavDisclosure>
 * </Nav>
 * @example
 * <Nav aria-label="Docs">
 *   <NavDisclosure>
 *     <NavDisclosureButton>Getting started</NavDisclosureButton>
 *     <NavDisclosureContent>
 *       <NavList><NavLink href="/install">Install</NavLink></NavList>
 *     </NavDisclosureContent>
 *   </NavDisclosure>
 * </Nav>
 */
export function NavDisclosure({
  button,
  content,
  ...props
}: NavDisclosureProps) {
  return (
    <Disclosure
      recipe={navDisclosure}
      {...props}
      button={createOptionalRender(NavDisclosureButton, button)}
      content={createRender(NavDisclosureContent, content)}
      render={<NavDisclosureRoot render={props.render} />}
    />
  );
}

// The button content box clips, so a bar inside it could never show.
export interface NavButtonProps extends Omit<
  ButtonProps<typeof navButton>,
  "recipe" | "bar"
> {}

/**
 * Renders a standalone nav row. Use `NavSlot` for its icon, badge, avatar, or
 * shortcut, `NavButtonContent` for its label, and the `render` prop for a row
 * that should be an anchor.
 * @example
 * <NavButton render={<a href="/docs" />}>
 *   <NavButtonContent>Docs</NavButtonContent>
 * </NavButton>
 */
export function NavButton(props: NavButtonProps) {
  return <Button recipe={navButton} {...props} />;
}

export interface NavButtonContentProps extends ak.RoleProps<"span"> {}

/**
 * The label of a nav row.
 * @example
 * <NavButton render={<a href="/updates" />}>
 *   <NavButtonContent>Updates</NavButtonContent>
 *   <NavSlot $kind="badge" $p="md">3</NavSlot>
 * </NavButton>
 */
export function NavButtonContent(props: NavButtonContentProps) {
  const [variantProps, rest] = splitProps(props, navButtonContent);
  return <ak.Role.span {...navButtonContent.jsx(variantProps)} {...rest} />;
}

export interface NavDisclosureButtonProps extends Omit<
  DisclosureButtonProps<typeof navDisclosureButton>,
  "recipe"
> {}

/**
 * Renders the button of a `NavDisclosure`. Its `icon` leads the label on the
 * nav's icon column. With an explicit `label`, children follow it, such as a
 * `NavSlot` with a count. The indicator defaults to `chevron-right-end` with an
 * icon and `chevron-right-start` without one.
 * @example
 * <Nav aria-label="Docs">
 *   <NavDisclosure
 *     button={
 *       <NavDisclosureButton label="Guides">
 *         <NavSlot $kind="badge" $p="md">3</NavSlot>
 *       </NavDisclosureButton>
 *     }
 *   >
 *     <NavList><NavLink href="/install">Install</NavLink></NavList>
 *   </NavDisclosure>
 * </Nav>
 */
export function NavDisclosureButton({
  label,
  icon,
  indicator = isRenderable(icon) ? "chevron-right-end" : "chevron-right-start",
  ...props
}: NavDisclosureButtonProps) {
  const labelProps =
    label === undefined && isRenderable(props.children)
      ? { children: props.children }
      : label;
  const labelEl = createOptionalRender(DisclosureButtonLabel, labelProps);
  return (
    <DisclosureButton
      recipe={navDisclosureButton}
      icon={icon}
      indicator={indicator}
      {...props}
      label={
        labelEl
          ? React.cloneElement(labelEl, {
              children: (
                <NavButtonContent>{labelEl.props.children}</NavButtonContent>
              ),
            })
          : null
      }
    >
      {label !== undefined && props.children}
    </DisclosureButton>
  );
}

export interface NavDisclosureContentProps extends DisclosureContentProps {
  /**
   * Custom body element or `NavDisclosureContentBody` props. Defaults to a
   * `NavDisclosureContentBody` containing the content children.
   */
  body?: React.ReactElement | NavDisclosureContentBodyProps;
}

/**
 * Collapsible navigation rows with a vertical guide enabled by default. Wrap
 * links in a `NavList` inside the content.
 * @example
 * <Nav aria-label="Docs">
 *   <NavDisclosure
 *     button="Getting started"
 *     content={<NavDisclosureContent guide={false} />}
 *   >
 *     <NavList><NavLink href="/install">Install</NavLink></NavList>
 *   </NavDisclosure>
 * </Nav>
 */
export function NavDisclosureContent(props: NavDisclosureContentProps) {
  const body = createRender(NavDisclosureContentBody, props.body);
  return <DisclosureContent guide {...props} body={body} />;
}

export interface NavDisclosureContentBodyProps extends Omit<
  DisclosureContentBodyProps<typeof navDisclosureContentBody>,
  "recipe"
> {}

/**
 * Aligns nested navigation rows and applies their spacing. Created by
 * `NavDisclosureContent` unless its `body` prop supplies a replacement.
 * @example
 * <Nav aria-label="Docs">
 *   <NavDisclosure
 *     button="Getting started"
 *     content={{ body: <NavDisclosureContentBody /> }}
 *   >
 *     <NavList><NavLink href="/install">Install</NavLink></NavList>
 *   </NavDisclosure>
 * </Nav>
 */
export function NavDisclosureContentBody(props: NavDisclosureContentBodyProps) {
  return <DisclosureContentBody recipe={navDisclosureContentBody} {...props} />;
}
