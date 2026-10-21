import type { NavLinkProps } from "@ariakit/ui/components/nav.ariakit.react";
import { NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import {
  ClientOnly,
  RouterContextProvider,
  RouterProvider,
  createLink,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useMatchRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { forwardRef, useState } from "react";

// The examples render no route components, so one route matches every path.
const rootRoute = createRootRoute();
const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: "$" }),
]);

// TanStack Router marks a link as current when a navigation starts, before its
// view transition captures the old page. The committed route marks the link
// instead, so the transition can move the bar from the old link to the new one.
// React 18 passes the link ref only through forwardRef.
const CommittedNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function CommittedNavLink(props, ref) {
    const matchRoute = useMatchRoute();
    const isCurrent = props.href != null && !!matchRoute({ to: props.href });
    return (
      <NavLink
        {...props}
        ref={ref}
        aria-current={isCurrent ? "page" : undefined}
      />
    );
  },
);

/**
 * A `NavLink` that navigates with TanStack Router and is current while its
 * route is committed.
 */
export const RouterNavLink = createLink(CommittedNavLink);

export interface ExampleRouterProps {
  /** The route of the current link before any navigation. */
  initialPath: string;
  children?: ReactNode;
}

/**
 * Provides a TanStack Router with memory history, so the route stays in the
 * example and the page URL doesn't change. Navigations run in view transitions
 * of the `bar` type, which move named navigation bars.
 */
export function ExampleRouter({ initialPath, children }: ExampleRouterProps) {
  const [router] = useState(() =>
    createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [initialPath] }),
      defaultViewTransition: {
        // The first load has no old page to move from, and a link to the
        // current route moves nothing. A transition would still block pointer
        // input until it ends, so these skip it.
        types: ({ fromLocation, pathChanged }) =>
          fromLocation && pathChanged ? ["bar"] : false,
      },
    }),
  );
  return (
    <RouterContextProvider router={router}>
      {children}
      {/* RouterProvider runs navigations, and its routes render nothing. Its
          client tree differs from its server render, so it mounts after
          hydration. */}
      <ClientOnly>
        <RouterProvider router={router} />
      </ClientOnly>
    </RouterContextProvider>
  );
}
