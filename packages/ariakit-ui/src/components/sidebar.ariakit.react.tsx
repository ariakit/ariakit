import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { useHasPainted } from "../react-hooks/use-has-painted.react.ts";
import { useIsMobile } from "../react-hooks/use-is-mobile.react.ts";
import { sidebar, sidebarBody, sidebarSection } from "../styles/sidebar.ts";

interface SidebarContextType {
  side: "start" | "end";
}

const defaultSidebarContext: SidebarContextType = {
  side: "start",
};

const SidebarContext = React.createContext<SidebarContextType>(
  defaultSidebarContext,
);

// Collapsible detection must key off SidebarProvider specifically. Reading the
// generic dialog context would flag a sidebar inside any unrelated
// DialogProvider and hijack that dialog's store.
const SidebarProviderContext = React.createContext(false);

export interface SidebarProps
  extends
    ak.RoleProps<"div">,
    VariantProps<typeof sidebar>,
    Partial<SidebarContextType> {
  /**
   * How the sidebar collapses. With `"icon"` the panel stays in the page and
   * `collapsed` narrows it to its icon rail. With `true` the provider slides
   * the whole panel out of the page and back in. Under the mobile breakpoint
   * both become a drawer: a modal dialog the provider opens over the page.
   * Defaults to `true` inside a `SidebarProvider`. Without a provider nothing
   * can open or close the panel, so the sidebar is a plain panel whatever the
   * value.
   */
  collapsible?: boolean | "icon";
  /** Whether the sidebar is collapsed to its minimum width. */
  collapsed?: boolean;
}

/**
 * Side panel of a page. On desktop it is part of the page layout: a plain
 * panel, or one its provider slides in and out. Under the mobile breakpoint a
 * collapsible sidebar becomes a drawer, a modal dialog the provider opens over
 * the page from a `SidebarToggle`.
 * @example
 * <SidebarProvider>
 *   <SidebarToggle />
 *   <Sidebar collapsible="icon" collapsed={collapsed}>
 *     <SidebarHeader>...</SidebarHeader>
 *     <SidebarBody>...</SidebarBody>
 *     <SidebarFooter>...</SidebarFooter>
 *   </Sidebar>
 * </SidebarProvider>
 */
export function Sidebar({
  side,
  collapsible,
  collapsed,
  ...props
}: SidebarProps) {
  const isMobile = useIsMobile();
  const hasPainted = useHasPainted();
  const context = React.useContext(SidebarContext);
  const hasSidebarProvider = React.useContext(SidebarProviderContext);
  // Copy before useMemo; mutating the `side` parameter makes that memo
  // unpreservable to the React Compiler.
  const resolvedSide = side ?? context.side;
  // Only a provider can open and close the panel.
  const resolvedCollapsible = hasSidebarProvider && (collapsible ?? true);
  // Under the mobile breakpoint a collapsible sidebar is a drawer over the
  // page. On desktop it is part of the page: a disclosure when it collapses
  // whole, a plain panel when it collapses to its icon rail.
  const isDrawer = !!resolvedCollapsible && isMobile;
  const isDisclosure = resolvedCollapsible === true && !isMobile;

  const contextValue = React.useMemo(
    () => ({ side: resolvedSide }),
    [resolvedSide],
  );
  const [variantProps, rest] = splitProps(props, sidebar);

  props = {
    ...sidebar.jsx({
      ...variantProps,
      // A drawer has no rail to narrow to.
      $collapsed: isDrawer ? false : (variantProps.$collapsed ?? !!collapsed),
      // The drawer lives in a portal where container units can't reach the app
      // container.
      $fullHeight: variantProps.$fullHeight ?? isDrawer,
      // Motion waits for the first paint: a server-rendered panel settles in
      // place instead of sliding in, and a collapsed state restored on the
      // client never plays out.
      $animated: variantProps.$animated ?? hasPainted,
    }),
    ...rest,
    children: (
      <SidebarContext.Provider value={contextValue}>
        {rest.children}
      </SidebarContext.Provider>
    ),
  };

  if (isDrawer) {
    return <ak.Dialog {...props} />;
  }
  if (isDisclosure) {
    return <ak.DisclosureContent {...props} />;
  }
  // The open marker keeps the panel in place: without it the sidebar styles
  // read the panel as closed and slide it out of view.
  return <ak.Role data-open {...props} />;
}

export interface SidebarProviderProps
  extends ak.DialogProviderProps, Partial<SidebarContextType> {}

export function SidebarProvider({
  side = defaultSidebarContext.side,
  ...props
}: SidebarProviderProps) {
  const contextValue = React.useMemo(() => ({ side }), [side]);
  return (
    <SidebarProviderContext.Provider value={true}>
      <SidebarContext.Provider value={contextValue}>
        <ak.DialogProvider {...props} />
      </SidebarContext.Provider>
    </SidebarProviderContext.Provider>
  );
}

export interface SidebarToggleProps extends ak.DialogDisclosureProps {}

/**
 * Button that opens and closes the sidebar through its provider. Under the
 * mobile breakpoint it opens the drawer, so it announces a dialog. On desktop
 * it is a plain disclosure of the panel in the page.
 */
export function SidebarToggle(props: SidebarToggleProps) {
  const isMobile = useIsMobile();
  const context = ak.useDialogContext();
  const store = props.store ?? context;
  const isOpen = ak.useStoreState(store, "open");
  const children = props.children ?? (
    <span className="sr-only">
      {isOpen ? "Collapse sidebar" : "Expand sidebar"}
    </span>
  );
  if (isMobile) {
    return <ak.DialogDisclosure {...props}>{children}</ak.DialogDisclosure>;
  }
  return <ak.Disclosure {...props}>{children}</ak.Disclosure>;
}

export interface SidebarHeaderProps
  extends ak.RoleProps<"div">, VariantProps<typeof sidebarSection> {}

export function SidebarHeader(props: SidebarHeaderProps) {
  const [variantProps, rest] = splitProps(props, sidebarSection);
  return <ak.Role {...sidebarSection.jsx(variantProps)} {...rest} />;
}

export interface SidebarBodyProps
  extends ak.RoleProps<"div">, VariantProps<typeof sidebarBody> {}

export function SidebarBody(props: SidebarBodyProps) {
  const [variantProps, rest] = splitProps(props, sidebarBody);
  return <ak.Role {...sidebarBody.jsx(variantProps)} {...rest} />;
}

export interface SidebarFooterProps
  extends ak.RoleProps<"div">, VariantProps<typeof sidebarSection> {}

export function SidebarFooter(props: SidebarFooterProps) {
  const [variantProps, rest] = splitProps(props, sidebarSection);
  return <ak.Role {...sidebarSection.jsx(variantProps)} {...rest} />;
}
