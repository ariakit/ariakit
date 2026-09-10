import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
} from "../react-utils/create-render.react.ts";
import {
  nav,
  navButton,
  navButtonContent,
  navDisclosure,
  navDisclosureContent,
  navDisclosureContentBody,
  navGlider,
  navGroup,
  navGroupLabel,
  navIcon,
  navLink,
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
  DisclosureContent,
  DisclosureContentBody,
} from "./disclosure.ariakit.react.tsx";

const NavDisclosureContext = React.createContext<
  ak.DisclosureStore | undefined
>(undefined);

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
   * that bring their own lists.
   */
  list?: React.ReactElement | NavListProps | false;
  /**
   * A glider that travels between the rows of the nav, in its own list, in a
   * group or in a disclosure alike, rendered before them.
   */
  glider?: NavGliderValue;
}

// The properties whose transitions move the rows of a nav: a disclosure content
// opening or closing, and a row squaring up as a sidebar collapses.
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
  const listEl = list === false ? null : createRender(NavList, list);
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  useSettling(element);
  return (
    <ak.Role.nav
      {...nav.jsx(variantProps)}
      {...rest}
      // The inner element takes the state setter as its ref, and Ariakit
      // merges it with the caller's ref and render element.
      render={<ak.Role.nav ref={setElement} render={rest.render} />}
    >
      {renderGliders(glider)}
      {listEl ? <ak.Role.ul render={listEl}>{children}</ak.Role.ul> : children}
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
}

export function NavLink({ currentUrl, ...props }: NavLinkProps) {
  const [variantProps, rest] = splitProps(props, navLink);
  const isCurrent = isCurrentPage(currentUrl, rest.href);
  const disclosure = React.useContext(NavDisclosureContext);

  React.useEffect(() => {
    if (!isCurrent) return;
    disclosure?.show();
  }, [isCurrent, disclosure]);

  return (
    <ak.Role.a
      aria-current={isCurrent ? "page" : undefined}
      {...navLink.jsx(variantProps)}
      {...rest}
    />
  );
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
 * keeps the line height while the sidebar is expanded so the label aligns, and
 * squares to the icon size when the sidebar collapses.
 */
export function NavIcon(props: NavIconProps) {
  const [variantProps, rest] = splitProps(props, navIcon);
  return <ak.Role.span {...navIcon.jsx(variantProps)} {...rest} />;
}

export interface NavDisclosureProps
  extends DisclosureProps, VariantProps<typeof navDisclosure> {
  button?: React.ReactNode | NavDisclosureButtonProps;
  content?: React.ReactElement | NavDisclosureContentProps;
}

function NavDisclosureRoot(props: ak.RoleProps<"li">) {
  // Capture this disclosure's store before a nested provider can replace the
  // generic context, which also carries unrelated dialogs and popovers.
  const disclosure = ak.useDisclosureContext();
  return (
    <NavDisclosureContext.Provider value={disclosure}>
      <ak.Role.li {...props} />
    </NavDisclosureContext.Provider>
  );
}

export function NavDisclosure(props: NavDisclosureProps) {
  const [variantProps, rest] = splitProps(props, navDisclosure);
  const button = createOptionalRender(NavDisclosureButton, rest.button);
  const content = createRender(NavDisclosureContent, rest.content);
  return (
    <Disclosure
      // The row and its content are already spaced apart, so the button needs
      // no hover ramp between them.
      $contentPadding
      // A nav row is a field-sized frame with control-sized padding.
      $rounded="lg"
      $p={2}
      {...navDisclosure.jsx(variantProps)}
      {...rest}
      button={button}
      content={content}
      render={<NavDisclosureRoot render={rest.render} />}
    />
  );
}

export interface NavButtonProps
  extends ButtonProps, VariantProps<typeof navButton> {}

/**
 * Renders a nav row that is not a disclosure, such as a sidebar brand row or a
 * single link that collapses with the sidebar. Wrap the label in
 * `NavButtonContent` so it fades on collapse the way a disclosure row's does,
 * and use the `render` prop for a row that should be an anchor.
 */
export function NavButton(props: NavButtonProps) {
  const [variantProps, rest] = splitProps(props, navButton);
  return (
    <Button
      $rounded="lg"
      // The row sits flush with the surface around it, like a nav link.
      $lightnessOffset={false}
      // The row's own list carries the press (see navButton).
      $transition={false}
      {...navButton.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface NavButtonContentProps extends ak.RoleProps<"span"> {}

/**
 * The label of a nav row, which collapses along with the sidebar.
 */
export function NavButtonContent(props: NavButtonContentProps) {
  const [variantProps, rest] = splitProps(props, navButtonContent);
  return <ak.Role.span {...navButtonContent.jsx(variantProps)} {...rest} />;
}

export interface NavDisclosureButtonProps
  extends DisclosureButtonProps, VariantProps<typeof navButton> {}

export function NavDisclosureButton(props: NavDisclosureButtonProps) {
  const [variantProps, rest] = splitProps(props, navButton);
  return (
    <DisclosureButton
      indicator="chevron-right-end"
      // The nav row spaces its icon and label through its own gap classes.
      $gap="none"
      // The row animates its own collapse, so the button's corner, hover ramp
      // and press timings would only compete with it. The row's own list
      // carries the press instead (see navButton).
      $transition={false}
      {...navButton.jsx(variantProps)}
      {...rest}
    >
      <NavButtonContent>{rest.children}</NavButtonContent>
    </DisclosureButton>
  );
}

export interface NavDisclosureContentProps
  extends DisclosureContentProps, VariantProps<typeof navDisclosureContent> {
  body?: React.ReactElement | NavDisclosureContentBodyProps;
}

export function NavDisclosureContent(props: NavDisclosureContentProps) {
  const [variantProps, rest] = splitProps(props, navDisclosureContent);
  const body = createRender(NavDisclosureContentBody, rest.body);
  return (
    <DisclosureContent
      guide
      {...navDisclosureContent.jsx(variantProps)}
      {...rest}
      body={body}
    />
  );
}

export interface NavDisclosureContentBodyProps
  extends
    DisclosureContentBodyProps,
    VariantProps<typeof navDisclosureContentBody> {}

export function NavDisclosureContentBody(props: NavDisclosureContentBodyProps) {
  const [variantProps, rest] = splitProps(props, navDisclosureContentBody);
  return (
    <DisclosureContentBody
      // The body paints no surface of its own: a nav glider that covers a
      // row inside it paints under the content, and it has to show through.
      $layer="transparent"
      {...navDisclosureContentBody.jsx(variantProps)}
      {...rest}
    />
  );
}
