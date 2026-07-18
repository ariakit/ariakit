import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { useIsMobile } from "../react-hooks/use-is-mobile.ts";
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

// Collapsible detection must key off SidebarProvider specifically. Reading
// the generic dialog context would flag a sidebar inside any unrelated
// DialogProvider and hijack that dialog's store.
const SidebarProviderContext = React.createContext(false);

export interface SidebarProps
  extends
    ak.RoleProps<"div">,
    VariantProps<typeof sidebar>,
    Partial<SidebarContextType> {
  collapsible?: boolean | "icon";
  /** Whether the sidebar is collapsed to its minimum width. */
  collapsed?: boolean;
}

export function Sidebar({
  side,
  collapsible,
  collapsed,
  ...props
}: SidebarProps) {
  const isMobile = useIsMobile();
  const context = React.useContext(SidebarContext);
  const hasSidebarProvider = React.useContext(SidebarProviderContext);

  side = side ?? context.side;
  collapsible = collapsible ?? hasSidebarProvider;

  const contextValue = React.useMemo(() => ({ side }), [side]);
  const [variantProps, rest] = splitProps(props, sidebar);
  const isDialog = collapsible === true || (collapsible && isMobile);

  props = {
    ...sidebar.jsx({
      $collapsed: !!collapsed,
      // Modal sidebars live in a portal where container units can't reach
      // the app container.
      $fullHeight: isDialog && isMobile,
      ...variantProps,
    }),
    ...rest,
    children: (
      <SidebarContext.Provider value={contextValue}>
        {rest.children}
      </SidebarContext.Provider>
    ),
  };

  if (isDialog) {
    return (
      <ak.Dialog
        modal={isMobile}
        hideOnEscape={isMobile}
        hideOnInteractOutside={isMobile}
        // Only a standalone collapsible sidebar forces itself open; with a
        // SidebarProvider the provider store drives visibility.
        open={hasSidebarProvider ? undefined : true}
        // A desktop sidebar mounts open as part of the page layout; moving
        // focus into it only makes sense for the mobile drawer.
        autoFocusOnShow={isMobile}
        {...props}
      />
    );
  }
  return <ak.Role {...props} />;
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

export function SidebarToggle(props: SidebarToggleProps) {
  const context = ak.useDialogContext();
  const isOpen = ak.useStoreState(context, "open");
  return (
    <ak.DialogDisclosure {...props}>
      <span className="sr-only">
        {isOpen ? "Collapse sidebar" : "Expand sidebar"}
      </span>
    </ak.DialogDisclosure>
  );
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
