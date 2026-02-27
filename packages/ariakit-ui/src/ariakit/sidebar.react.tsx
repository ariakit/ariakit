import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import { useIsMobile } from "../react-hooks/use-is-mobile.ts";

interface SidebarContextType {
  side: "start" | "end";
}

const defaultSidebarContext: SidebarContextType = {
  side: "start",
};

const SidebarContext = React.createContext<SidebarContextType>(
  defaultSidebarContext,
);

export interface SidebarProps
  extends ak.RoleProps<"div">,
    Partial<SidebarContextType> {
  collapsible?: boolean | "icon";
  collapsed?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
}

export function Sidebar({
  side,
  collapsible,
  collapsed,
  baseClassName,
  ...props
}: SidebarProps) {
  const isMobile = useIsMobile();
  const context = React.useContext(SidebarContext);
  const dialog = ak.useDialogContext();

  side = side ?? context.side;
  collapsible = collapsible ?? !!dialog;

  const contextValue = React.useMemo(() => ({ side }), [side]);

  props = {
    ...props,
    className: clsx(
      baseClassName || "ak-sidebar",
      collapsed && "ak-sidebar-collapsed",
      props.className,
    ),
    children: (
      <SidebarContext.Provider value={contextValue}>
        {props.children}
      </SidebarContext.Provider>
    ),
  };

  if (collapsible === true || (collapsible && isMobile)) {
    return (
      <ak.Dialog
        modal={isMobile}
        hideOnEscape={isMobile}
        hideOnInteractOutside={isMobile}
        open
        {...props}
        className={clsx(
          isMobile && "fixed start-0 top-0 h-full z-10",
          props.className,
        )}
      />
    );
  }
  return <ak.Role {...props} />;
}

export interface SidebarProviderProps
  extends ak.DialogProviderProps,
    Partial<SidebarContextType> {}

export function SidebarProvider({
  side = defaultSidebarContext.side,
  ...props
}: SidebarProviderProps) {
  const contextValue = React.useMemo(() => ({ side }), [side]);
  return (
    <SidebarContext.Provider value={contextValue}>
      <ak.DialogProvider {...props} />
    </SidebarContext.Provider>
  );
}

export interface SidebarToggleProps extends ak.DialogDisclosureProps {
  /** Custom base class name. */
  baseClassName?: string;
}

export function SidebarToggle({ baseClassName, ...props }: SidebarToggleProps) {
  const context = ak.useDialogContext();
  const isOpen = ak.useStoreState(context, "open");
  return (
    <ak.DialogDisclosure
      {...props}
      className={clsx(baseClassName || "ak-sidebar-toggle", props.className)}
    >
      <span className="sr-only">
        {isOpen ? "Collapse sidebar" : "Expand sidebar"}
      </span>
    </ak.DialogDisclosure>
  );
}

export interface SidebarHeaderProps extends ak.RoleProps<"div"> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function SidebarHeader({ baseClassName, ...props }: SidebarHeaderProps) {
  return (
    <ak.Role
      {...props}
      className={clsx(baseClassName || "ak-sidebar-header", props.className)}
    />
  );
}

export interface SidebarBodyProps extends ak.RoleProps<"div"> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function SidebarBody({ baseClassName, ...props }: SidebarBodyProps) {
  return (
    <ak.Role
      {...props}
      className={clsx(baseClassName || "ak-sidebar-body", props.className)}
    />
  );
}

export interface SidebarFooterProps extends ak.RoleProps<"div"> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function SidebarFooter({ baseClassName, ...props }: SidebarFooterProps) {
  return (
    <ak.Role
      {...props}
      className={clsx(baseClassName || "ak-sidebar-footer", props.className)}
    />
  );
}
