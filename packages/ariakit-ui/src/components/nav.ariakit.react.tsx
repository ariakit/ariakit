import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type * as React from "react";
import { useEffect } from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import {
  nav,
  navButton,
  navButtonContent,
  navDisclosure,
  navDisclosureContent,
  navDisclosureContentBody,
  navGroup,
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

export interface NavProps
  extends ak.RoleProps<"nav">, VariantProps<typeof nav> {
  list?: React.ReactElement | NavListProps;
}

export function Nav({ list, children, ...props }: NavProps) {
  const [variantProps, rest] = splitProps(props, nav);
  const listEl = createRender(NavList, list);
  return (
    <ak.Role.nav {...nav.jsx(variantProps)} {...rest}>
      <ak.Role.ul render={listEl}>{children}</ak.Role.ul>
    </ak.Role.nav>
  );
}

export interface NavListProps
  extends ak.RoleProps<"ul">, VariantProps<typeof navList> {}

export function NavList(props: NavListProps) {
  const [variantProps, rest] = splitProps(props, navList);
  return <ak.Role.ul {...navList.jsx(variantProps)} {...rest} />;
}

export interface NavLinkProps
  extends ak.RoleProps<"a">, VariantProps<typeof navLink> {
  currentUrl?: string | URL;
}

export function NavLink({ currentUrl, ...props }: NavLinkProps) {
  const [variantProps, rest] = splitProps(props, navLink);
  const isCurrent = isCurrentPage(currentUrl, rest.href);
  const disclosure = ak.useDisclosureContext();

  useEffect(() => {
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

export interface NavGroupLabelProps extends ak.GroupLabelProps {}

export function NavGroupLabel(props: NavGroupLabelProps) {
  return <ak.GroupLabel {...props} />;
}

export interface NavIconProps
  extends ak.RoleProps<"span">, VariantProps<typeof navIcon> {}

/**
 * Renders the icon slot of a nav row, sized by the Nav icon-size variable.
 * It keeps the line height while the sidebar is expanded so the label
 * aligns, and squares to the icon size when the sidebar collapses.
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

export function NavDisclosure(props: NavDisclosureProps) {
  const [variantProps, rest] = splitProps(props, navDisclosure);
  const button = createRender(NavDisclosureButton, rest.button);
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
      render={<ak.Role.li render={rest.render} />}
    />
  );
}

export interface NavButtonProps
  extends ButtonProps, VariantProps<typeof navButton> {}

/**
 * Renders a nav row that is not a disclosure, such as a sidebar brand row or
 * a single link that collapses with the sidebar. Wrap the label in
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
  return <ak.Role.span {...navButtonContent.jsx({})} {...props} />;
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
      // The row animates its own collapse, so the button's corner and hover
      // ramp timings would only compete with it.
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
      {...navDisclosureContentBody.jsx(variantProps)}
      {...rest}
    />
  );
}
