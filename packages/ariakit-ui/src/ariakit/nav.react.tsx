import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type * as React from "react";
import { useEffect } from "react";
import { createRender } from "../react-utils/create-render.ts";
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
import type {
  DisclosureButtonProps,
  DisclosureContentBodyProps,
  DisclosureContentProps,
  DisclosureProps,
} from "./disclosure.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureContentBody,
} from "./disclosure.react.tsx";

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
      split
      {...navDisclosure.jsx(variantProps)}
      {...rest}
      button={button}
      content={content}
      render={<ak.Role.li render={rest.render} />}
    />
  );
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
      {...navButton.jsx(variantProps)}
      {...rest}
    >
      <span {...navButtonContent.jsx({})}>{rest.children}</span>
    </DisclosureButton>
  );
}

export interface NavDisclosureContentProps
  extends DisclosureContentProps, VariantProps<typeof navDisclosureContent> {
  body?: React.ReactElement | NavDisclosureBodyProps;
}

export function NavDisclosureContent(props: NavDisclosureContentProps) {
  const [variantProps, rest] = splitProps(props, navDisclosureContent);
  const body = createRender(NavDisclosureBody, rest.body);
  return (
    <DisclosureContent
      guide
      {...navDisclosureContent.jsx(variantProps)}
      {...rest}
      body={body}
    />
  );
}

export interface NavDisclosureBodyProps
  extends
    DisclosureContentBodyProps,
    VariantProps<typeof navDisclosureContentBody> {}

export function NavDisclosureBody(props: NavDisclosureBodyProps) {
  const [variantProps, rest] = splitProps(props, navDisclosureContentBody);
  return (
    <DisclosureContentBody
      {...navDisclosureContentBody.jsx(variantProps)}
      {...rest}
    />
  );
}
