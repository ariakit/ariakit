import type { NavLinkProps } from "@ariakit/ui/components/nav.ariakit.react";
import { NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import {
  createMemoryRouter,
  NavLink as RouterLink,
  RouterProvider,
} from "react-router";

export interface RouterNavLinkProps extends NavLinkProps {
  /** The route that the link navigates to. */
  to: string;
}

// React Router warns when it can't start a requested view transition.
function supportsViewTransitions() {
  if (typeof document === "undefined") return false;
  return typeof document.startViewTransition === "function";
}

/**
 * A `NavLink` that navigates with React Router in a view transition. React
 * Router marks the link as current.
 */
export function RouterNavLink({ to, ...props }: RouterNavLinkProps) {
  return (
    <NavLink
      {...props}
      render={<RouterLink to={to} viewTransition={supportsViewTransitions()} />}
    />
  );
}

// The examples render the same content on every route.
const ContentContext = createContext<ReactNode>(null);

function Content() {
  return useContext(ContentContext);
}

const routes = [{ path: "*", Component: Content }];

// React Router starts view transitions without types, so the rules for the
// `bar` type don't apply. These examples' transitions only move bars, so the
// page stays out of every transition and keeps taking clicks.
const viewTransitionStyles = `
  :root:active-view-transition {
    view-transition-name: none;
  }
  :root:active-view-transition::view-transition {
    pointer-events: none;
  }
`;

export interface ExampleRouterProps {
  /** The route of the current link before any navigation. */
  initialPath: string;
  children?: ReactNode;
}

/**
 * Provides a React Router with memory history, so the route stays in the
 * example and the page URL doesn't change.
 */
export function ExampleRouter({ initialPath, children }: ExampleRouterProps) {
  const [router] = useState(() =>
    createMemoryRouter(routes, { initialEntries: [initialPath] }),
  );
  return (
    <ContentContext.Provider value={children}>
      <style>{viewTransitionStyles}</style>
      <RouterProvider router={router} />
    </ContentContext.Provider>
  );
}
