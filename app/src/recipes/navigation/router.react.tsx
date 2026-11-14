import type { NavLinkProps } from "@ariakit/ui/components/nav.ariakit.react";
import { NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import {
  createMemoryRouter,
  RouterProvider,
  useLinkClickHandler,
  useLocation,
} from "react-router";

export interface RouterNavLinkProps extends NavLinkProps {
  /** The route that the link navigates to. */
  to: string;
}

// The memory router's paths don't exist on the page that renders the example,
// so links point to a fragment of the page instead. A link opened without the
// router, such as in a new tab, then stays on the page.
function getFragment(path: string) {
  return `#${path.slice(1)}`;
}

/** A `NavLink` that navigates with React Router, without a page load. */
export function RouterNavLink({ to, onClick, ...props }: RouterNavLinkProps) {
  const { pathname } = useLocation();
  const handleClick = useLinkClickHandler(to);
  return (
    <NavLink
      href={getFragment(to)}
      currentUrl={getFragment(pathname)}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleClick(event);
      }}
    />
  );
}

// The examples render the same content on every route.
const ContentContext = createContext<ReactNode>(null);

function Content() {
  return useContext(ContentContext);
}

const routes = [{ path: "*", Component: Content }];

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
      <RouterProvider router={router} />
    </ContentContext.Provider>
  );
}
