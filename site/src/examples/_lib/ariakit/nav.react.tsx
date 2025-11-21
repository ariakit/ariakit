import * as ak from "@ariakit/react";
import clsx from "clsx";
import { useEffect } from "react";
import { createRender } from "../react-utils/create-render.ts";
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

function isCurrentPage(
  currentUrl?: string | URL,
  href?: string | URL,
): boolean {
  if (!href) return false;
  const base = new URL(currentUrl ?? "", "https://example.com");
  let dest: URL;
  try {
    dest = new URL(href, base);
  } catch {
    return false;
  }
  if (dest.origin !== base.origin) return false;
  const basePathname = base.pathname.replace(/\/$/, "");
  const destPathname = dest.pathname.replace(/\/$/, "");
  if (destPathname !== basePathname) return false;
  if (dest.hash && dest.hash !== base.hash) return false;
  base.searchParams.sort();
  dest.searchParams.sort();
  if (dest.search && dest.search !== base.search) return false;
  return true;
}

export interface NavProps extends ak.RoleProps<"nav"> {
  list?: React.ReactElement | NavListProps;
  /** Custom base class name. */
  baseClassName?: string;
}

export function Nav({ list, children, baseClassName, ...props }: NavProps) {
  const listEl = createRender(NavList, list);
  return (
    <ak.Role.nav
      {...props}
      className={clsx(baseClassName || "ak-nav", props.className)}
    >
      <ak.Role.ul render={listEl}>{children}</ak.Role.ul>
    </ak.Role.nav>
  );
}

export interface NavListProps extends ak.RoleProps<"ul"> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function NavList({ baseClassName, ...props }: NavListProps) {
  return (
    <ak.Role.ul
      {...props}
      className={clsx(baseClassName || "ak-nav-list", props.className)}
    />
  );
}

export interface NavLinkProps extends ak.RoleProps<"a"> {
  currentUrl?: string | URL;
  /** Custom base class name. */
  baseClassName?: string;
}

export function NavLink({ currentUrl, baseClassName, ...props }: NavLinkProps) {
  const isCurrent = isCurrentPage(currentUrl, props.href);
  const disclosure = ak.useDisclosureContext();

  useEffect(() => {
    if (!isCurrent) return;
    disclosure?.show();
  }, [isCurrent, disclosure]);

  return (
    <ak.Role.a
      {...props}
      aria-current={isCurrent ? "page" : undefined}
      className={clsx(baseClassName || "ak-nav-link", props.className)}
    />
  );
}

export interface NavGroupProps extends ak.GroupProps {
  /** Custom base class name. */
  baseClassName?: string;
}

export function NavGroup({ baseClassName, ...props }: NavGroupProps) {
  return (
    <ak.Group
      {...props}
      className={clsx(baseClassName || "ak-nav-group", props.className)}
    />
  );
}

export interface NavGroupLabelProps extends ak.GroupLabelProps {
  /** Custom base class name. */
  baseClassName?: string;
}

export function NavGroupLabel({ baseClassName, ...props }: NavGroupLabelProps) {
  return (
    <ak.GroupLabel
      {...props}
      className={clsx(baseClassName || "ak-nav-group-label", props.className)}
    />
  );
}

export interface NavDisclosureProps extends DisclosureProps {
  button?: React.ReactNode | NavDisclosureButtonProps;
  content?: React.ReactElement | NavDisclosureContentProps;
}

export function NavDisclosure(props: NavDisclosureProps) {
  const button = createRender(NavDisclosureButton, props.button);
  const content = createRender(NavDisclosureContent, props.content);
  return (
    <Disclosure
      split
      baseClassName="ak-nav-disclosure"
      {...props}
      button={button}
      content={content}
      render={<ak.Role.li render={props.render} />}
    />
  );
}

export interface NavDisclosureButtonProps extends DisclosureButtonProps {}

export function NavDisclosureButton(props: NavDisclosureButtonProps) {
  return (
    <DisclosureButton
      indicator="chevron-right-end"
      baseClassName="ak-nav-disclosure-button"
      {...props}
    >
      <span className="ak-nav-button-content">{props.children}</span>
    </DisclosureButton>
  );
}

export interface NavDisclosureContentProps extends DisclosureContentProps {
  body?: React.ReactElement | NavDisclosureBodyProps;
}

export function NavDisclosureContent(props: NavDisclosureContentProps) {
  const body = createRender(NavDisclosureBody, props.body);
  return (
    <DisclosureContent
      baseClassName="ak-nav-disclosure-content"
      guide
      {...props}
      body={body}
    />
  );
}

export interface NavDisclosureBodyProps extends DisclosureContentBodyProps {}

export function NavDisclosureBody(props: NavDisclosureBodyProps) {
  return (
    <DisclosureContentBody
      baseClassName="ak-nav-disclosure-content-body"
      {...props}
    />
  );
}
