import type { NavLinkProps } from "@ariakit/ui/components/nav.ariakit.react";
import { NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import type { MouseEvent, ReactNode } from "react";
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
  NavLink as RouterLink,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router";

export interface RouterNavLinkProps extends NavLinkProps {
  /** The route that the link navigates to. */
  to: string;
}

// Clicks that open the link elsewhere, such as in a new tab, stay with the
// browser.
function isPlainClick(event: MouseEvent) {
  if (event.button !== 0) return false;
  if (event.metaKey) return false;
  if (event.altKey) return false;
  if (event.ctrlKey) return false;
  if (event.shiftKey) return false;
  return true;
}

/**
 * A `NavLink` that navigates with React Router in a view transition of the
 * `bar` type. React Router marks the link as current.
 */
export function RouterNavLink({ to, ...props }: RouterNavLinkProps) {
  const navigate = useNavigate();
  return (
    <NavLink
      {...props}
      render={
        <RouterLink
          to={to}
          onClick={(event) => {
            if (event.defaultPrevented) return;
            if (!isPlainClick(event)) return;
            event.preventDefault();
            // A transition type applies only when it's added in the same
            // transition as the navigation.
            startTransition(() => {
              addTransitionType("bar");
              void navigate(to);
            });
          }}
        />
      }
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
