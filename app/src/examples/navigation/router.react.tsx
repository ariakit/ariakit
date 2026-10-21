import type { NavLinkProps } from "@ariakit/ui/components/nav.ariakit.react";
import { NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import type { ReactNode } from "react";
import {
  ViewTransition,
  addTransitionType,
  createContext,
  startTransition,
  useContext,
  useState,
} from "react";
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

/**
 * A `NavLink` that navigates with React Router in a view transition of the
 * `bar` type.
 */
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
        // React applies a transition type only to updates in the same
        // transition, so the link runs React Router's click handling inside
        // one.
        startTransition(() => {
          addTransitionType("bar");
          handleClick(event);
        });
      }}
    />
  );
}

// The examples render the same content on every route.
const ContentContext = createContext<ReactNode>(null);

function Content() {
  const { pathname } = useLocation();
  return (
    <>
      {useContext(ContentContext)}
      {/* React starts a view transition only when an update reaches a
          ViewTransition boundary. A boundary around the content would capture
          it, and captured content stops taking clicks until the transition
          ends. This empty boundary changes on every navigation and captures
          nothing. */}
      <ViewTransition key={pathname}>
        <span hidden />
      </ViewTransition>
    </>
  );
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
