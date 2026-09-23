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
  navIcon,
  navLink,
  navLinkContent,
  navLinkDescription,
  navLinkLabel,
  navLinkSlot,
  navList,
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

// The stores of every NavDisclosure around a row, outermost first, so a current
// link can open all of them and not only the nearest one.
const NavDisclosureContext = React.createContext<readonly ak.DisclosureStore[]>(
  [],
);

/**
 * A glider for a nav, as `NavGlider` props or an element, or several of them in
 * an array, such as a hover cover followed by a cover of the current row: a
 * later glider paints over an earlier one. `true` renders the default glider, a
 * flat cover of the current row.
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
   * The list that holds the rows, as an element or as `NavList` props. Set it
   * to `false` to render the children as they are, for a nav made of groups
   * that bring their own lists. Links with default items need a `NavList` or
   * another `ul`, `ol`, or `menu`; use `item={false}` for standalone links.
   */
  list?: React.ReactElement | NavListProps | false;
  /**
   * A glider that travels between the rows of the nav, in its own list, in a
   * group or in a disclosure alike, rendered before them.
   */
  glider?: NavGliderValue;
}

// The properties whose transitions move the rows of a nav when disclosure
// content opens or closes.
const ROW_MOVING_PROPERTIES = new Set(["height", "max-height"]);

/**
 * Marks the nav with `data-settling` while a transition inside it moves the
 * rows, so a glider stops easing after its row and follows it at once (see
 * navGlider). A glider's own transitions do not count. Native listeners: React
 * dispatches the end of a transition, but not its start.
 */
function useSettling(element: HTMLElement | null) {
  React.useEffect(() => {
    if (!element) return;
    let running = 0;
    const isRowMoving = (event: TransitionEvent) => {
      if (!ROW_MOVING_PROPERTIES.has(event.propertyName)) return false;
      // A capability check rather than instanceof: the target may come from
      // another realm.
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

export function Nav({ list, glider, children, ...props }: NavProps) {
  const [variantProps, rest] = splitProps(props, nav);
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  useSettling(element);
  return (
    <ak.Role.nav
      {...nav.jsx(variantProps)}
      {...rest}
      // The inner element takes the state setter as its ref, and Ariakit merges
      // it with the caller's ref and render element.
      render={<ak.Role.nav ref={setElement} render={rest.render} />}
    >
      {renderGliders(glider)}
      {list === false ? children : createRender(NavList, list, { children })}
    </ak.Role.nav>
  );
}

export interface NavListProps
  extends ak.RoleProps<"ul">, VariantProps<typeof navList> {}

export function NavList(props: NavListProps) {
  const [variantProps, rest] = splitProps(props, navList);
  return <ak.Role.ul {...navList.jsx(variantProps)} {...rest} />;
}

export interface NavGliderProps
  extends ak.RoleProps<"div">, VariantProps<typeof navGlider> {}

/**
 * Renders the element that glides between the rows of a `Nav` to mark the
 * current, hovered or focused one, as a cover of the row or as a bar beside it.
 * It goes before the rows, as the nav's first child, so it paints under them,
 * and it hides itself in browsers without CSS anchor positioning.
 */
export function NavGlider(props: NavGliderProps) {
  const [variantProps, rest] = splitProps(props, navGlider);
  return <ak.Role.div aria-hidden {...navGlider.jsx(variantProps)} {...rest} />;
}

export interface NavLinkProps
  extends ak.RoleProps<"a">, VariantProps<typeof navLink> {
  currentUrl?: string | URL;
  /**
   * The list item around the link. Set to `false` for a standalone link or an
   * existing item wrapper. All other props, including `ref` and `render`,
   * belong to the anchor. The default item needs a `NavList` or another `ul`,
   * `ol`, or `menu` parent, including inside disclosure content.
   */
  item?: React.ReactElement | ak.RoleProps<"li"> | false;
}

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

export interface NavLinkSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkSlot> {}

/**
 * Renders an icon, badge, avatar, or shortcut in the row of a `NavLink`. With
 * the default `icon` kind and size it is the same icon slot as `NavIcon`, sized
 * by the Nav icon size. `NavIcon` renders that icon in any nav row, such as a
 * `NavButton`.
 */
export function NavLinkSlot(props: NavLinkSlotProps) {
  const [variantProps, rest] = splitProps(props, navLinkSlot);
  const variants = navLinkSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...navLinkSlot.jsx(variantProps)} {...rest}>
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
 */
export function NavLinkContent(props: NavLinkContentProps) {
  const [variantProps, rest] = splitProps(props, navLinkContent);
  return <ak.Role.span {...navLinkContent.jsx(variantProps)} {...rest} />;
}

export interface NavLinkLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof navLinkLabel> {}

/**
 * Renders the label of a `NavLink`. Wrap the text in it when a `NavLinkSlot`
 * sits beside it: the slot spaces itself from the element next to it.
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
 */
export function NavLinkDescription(props: NavLinkDescriptionProps) {
  const [variantProps, rest] = splitProps(props, navLinkDescription);
  return <ak.Role.span {...navLinkDescription.jsx(variantProps)} {...rest} />;
}

export interface NavGroupProps
  extends ak.GroupProps, VariantProps<typeof navGroup> {}

export function NavGroup(props: NavGroupProps) {
  const [variantProps, rest] = splitProps(props, navGroup);
  return <ak.Group {...navGroup.jsx(variantProps)} {...rest} />;
}

export interface NavGroupLabelProps
  extends ak.GroupLabelProps, VariantProps<typeof navGroupLabel> {}

/**
 * Renders the label of a nav group, padded like a row and with its text
 * starting where the rows' content starts.
 */
export function NavGroupLabel(props: NavGroupLabelProps) {
  const [variantProps, rest] = splitProps(props, navGroupLabel);
  return <ak.GroupLabel {...navGroupLabel.jsx(variantProps)} {...rest} />;
}

export interface NavIconProps
  extends ak.RoleProps<"span">, VariantProps<typeof navIcon> {}

/**
 * Renders the icon slot of a nav row, sized by the Nav icon-size variable. It
 * keeps the line height so the label aligns with the icon. A badge or an avatar
 * in it takes the one-line box every control slot gives them instead.
 */
export function NavIcon(props: NavIconProps) {
  const [variantProps, rest] = splitProps(props, navIcon);
  const variants = navIcon.getVariants(variantProps);
  return (
    <ak.Role.span {...navIcon.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface NavDisclosureProps extends Omit<
  DisclosureProps<typeof navDisclosure>,
  "recipe"
> {
  button?: React.ReactNode | NavDisclosureButtonProps;
  content?: React.ReactElement | NavDisclosureContentProps;
}

function NavDisclosureRoot(props: ak.RoleProps<"li">) {
  // Capture this disclosure's store before a nested provider can replace the
  // generic context, which also carries unrelated dialogs and popovers.
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
 * A row of a `Nav` that discloses rows of its own. Its root paints no surface
 * by default: a nested section sits in a content that stacks over the nav's
 * gliders, so an opaque root would hide the covers of its rows.
 */
export function NavDisclosure({
  button,
  content,
  ...props
}: NavDisclosureProps) {
  return (
    <Disclosure
      // The order carries the contract: the recipe first, the caller's props
      // second, the composed slots last.
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
 * Renders a standalone nav row. Use `NavButtonContent` for its label and the
 * `render` prop for a row that should be an anchor.
 */
export function NavButton(props: NavButtonProps) {
  // The order carries the contract: the recipe first, the caller's props
  // second.
  return <Button recipe={navButton} {...props} />;
}

export interface NavButtonContentProps extends ak.RoleProps<"span"> {}

/**
 * The label of a nav row.
 */
export function NavButtonContent(props: NavButtonContentProps) {
  const [variantProps, rest] = splitProps(props, navButtonContent);
  return <ak.Role.span {...navButtonContent.jsx(variantProps)} {...rest} />;
}

export interface NavDisclosureButtonProps extends Omit<
  DisclosureButtonProps<typeof navDisclosureButton>,
  "recipe"
> {}

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
      // The order carries the contract: the recipe first, the caller's props
      // second, the composed label and children last.
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
  body?: React.ReactElement | NavDisclosureContentBodyProps;
}

export function NavDisclosureContent(props: NavDisclosureContentProps) {
  const body = createRender(NavDisclosureContentBody, props.body);
  return <DisclosureContent guide {...props} body={body} />;
}

export interface NavDisclosureContentBodyProps extends Omit<
  DisclosureContentBodyProps<typeof navDisclosureContentBody>,
  "recipe"
> {}

export function NavDisclosureContentBody(props: NavDisclosureContentBodyProps) {
  // The order carries the contract: the recipe first, the caller's props
  // second.
  return <DisclosureContentBody recipe={navDisclosureContentBody} {...props} />;
}
