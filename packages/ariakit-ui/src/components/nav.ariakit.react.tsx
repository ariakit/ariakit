import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
  isRenderable,
} from "../react-utils/create-render.react.ts";
import { wrapsSlotChildren } from "../styles/control.ts";
import {
  nav,
  navButton,
  navButtonContent,
  navDisclosure,
  navDisclosureButton,
  navDisclosureContentBody,
  navGlider,
  navGroup,
  navGroupLabel,
  navLink,
  navLinkContent,
  navLinkDescription,
  navLinkLabel,
  navList,
  navSlot,
} from "../styles/nav.ts";
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

/**
 * A glider element, props, or array. Later gliders paint over earlier ones.
 * `true` renders the default flat cover of the current row.
 */
export type NavGliderValue =
  | boolean
  | React.ReactElement
  | NavGliderProps
  | (React.ReactElement | NavGliderProps)[];

function renderGliders(value?: NavGliderValue) {
  if (!value) return null;
  if (value === true) return createRender(NavGlider);
  if (!Array.isArray(value)) return createRender(NavGlider, value);
  return value.map((item, index) => (
    <React.Fragment key={index}>{createRender(NavGlider, item)}</React.Fragment>
  ));
}

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
   * Indicator that moves between current rows, including rows in groups and
   * disclosures. Set `true` for the default `NavGlider`, or supply an element,
   * props, or an array of these. Omitted by default.
   */
  glider?: NavGliderValue;
}

// Disclosure transitions that move nav rows.
const ROW_MOVING_PROPERTIES = new Set(["height", "max-height"]);

/**
 * Disables glider easing while rows move, excluding the glider's transitions.
 */
function useSettling(element: HTMLElement | null) {
  React.useEffect(() => {
    if (!element) return;
    let running = 0;
    const isRowMoving = (event: TransitionEvent) => {
      if (!ROW_MOVING_PROPERTIES.has(event.propertyName)) return false;
      // The target may come from another realm.
      const target = event.target as Partial<Element> | null;
      return !target?.classList?.contains("glider");
    };
    const start = (event: TransitionEvent) => {
      if (!isRowMoving(event)) return;
      running += 1;
      element.setAttribute("data-settling", "");
    };
    const stop = (event: TransitionEvent) => {
      if (!isRowMoving(event)) return;
      running = Math.max(0, running - 1);
      if (running > 0) return;
      element.removeAttribute("data-settling");
    };
    element.addEventListener("transitionstart", start);
    element.addEventListener("transitionend", stop);
    element.addEventListener("transitioncancel", stop);
    return () => {
      element.removeEventListener("transitionstart", start);
      element.removeEventListener("transitionend", stop);
      element.removeEventListener("transitioncancel", stop);
      element.removeAttribute("data-settling");
    };
  }, [element]);
}

/**
 * A navigation landmark that wraps its rows in a `NavList` by default.
 * @example
 * <Nav aria-label="Main" glider>
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
export function Nav({ list, glider, children, ...props }: NavProps) {
  const [variantProps, rest] = splitProps(props, nav);
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  useSettling(element);
  return (
    <ak.Role.nav
      {...nav.jsx(variantProps)}
      {...rest}
      // Let Ariakit merge the state setter with the caller's ref and element.
      render={<ak.Role.nav ref={setElement} render={rest.render} />}
    >
      {renderGliders(glider)}
      {list === false ? children : createRender(NavList, list, { children })}
    </ak.Role.nav>
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

export interface NavGliderProps
  extends ak.RoleProps<"div">, VariantProps<typeof navGlider> {}

/**
 * Marks the current row with a cover or bar. Pass it to `Nav`'s `glider` prop
 * to paint below the rows. Hidden in browsers without CSS anchor positioning.
 * @example
 * <Nav aria-label="Main" glider={<NavGlider />}>
 *   <NavLink href="/" currentUrl="/">Home</NavLink>
 *   <NavLink href="/docs">Docs</NavLink>
 * </Nav>
 */
export function NavGlider(props: NavGliderProps) {
  const [variantProps, rest] = splitProps(props, navGlider);
  return <ak.Role.div aria-hidden {...navGlider.jsx(variantProps)} {...rest} />;
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
 */
export function NavLink({ currentUrl, item, ...props }: NavLinkProps) {
  const [variantProps, rest] = splitProps(props, navLink);
  const isCurrent = isCurrentPage(currentUrl, rest.href);
  const disclosures = React.useContext(NavDisclosureContext);

  React.useEffect(() => {
    if (!isCurrent) return;
    for (const disclosure of disclosures) {
      disclosure.show();
    }
  }, [isCurrent, disclosures]);

  const link = (
    <ak.Role.a
      aria-current={isCurrent ? "page" : undefined}
      {...navLink.jsx(variantProps)}
      {...rest}
    />
  );
  if (item === false) return link;
  return createRender(ak.Role.li, item, { children: link });
}

export interface NavSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof navSlot> {}

/**
 * Renders an icon, badge, avatar, or shortcut in a nav row. All except
 * shortcuts inherit the nav's `$slotSize`. Use `$p="auto"` for word badges.
 * Badge and shortcut content gets a span for text sizing and key direction.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink href="/updates">
 *     <NavLinkLabel>Updates</NavLinkLabel>
 *     <NavSlot $kind="badge">3</NavSlot>
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
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkLabel> {}

/**
 * Wraps a link's label so adjacent slots can set its margins. Required when a
 * slot follows the text or uses a named `$size`, such as `xl`.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink href="/updates">
 *     <NavLinkLabel>Updates</NavLinkLabel>
 *     <NavSlot $kind="badge">3</NavSlot>
 *   </NavLink>
 * </Nav>
 */
export function NavLinkLabel(props: NavLinkLabelProps) {
  const [variantProps, rest] = splitProps(props, navLinkLabel);
  return <ak.Role.span {...navLinkLabel.jsx(variantProps)} {...rest} />;
}

export interface NavLinkDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkDescription> {}

/**
 * Renders secondary text under the `NavLinkLabel` of a `NavLink`. It is part of
 * the link's content, so it is part of the link's accessible name too. To keep
 * it out of the name, give the label and the description an `id` and pass them
 * to the link as `aria-labelledby` and `aria-describedby`.
 * @example
 * <Nav aria-label="Main">
 *   <NavLink
 *     href="/docs"
 *     aria-labelledby="docs-label"
 *     aria-describedby="docs-description"
 *   >
 *     <NavLinkContent>
 *       <NavLinkLabel id="docs-label">Docs</NavLinkLabel>
 *       <NavLinkDescription id="docs-description">
 *         Guides and examples
 *       </NavLinkDescription>
 *     </NavLinkContent>
 *   </NavLink>
 * </Nav>
 */
export function NavLinkDescription(props: NavLinkDescriptionProps) {
  const [variantProps, rest] = splitProps(props, navLinkDescription);
  return <ak.Role.span {...navLinkDescription.jsx(variantProps)} {...rest} />;
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
 * Discloses nested nav rows. The transparent root keeps their gliders visible.
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

export interface NavButtonProps extends Omit<
  ButtonProps<typeof navButton>,
  "recipe"
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
 *   <NavSlot $kind="badge">3</NavSlot>
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
 *         <NavSlot $kind="badge">3</NavSlot>
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
