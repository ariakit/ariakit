/**
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.org/plus/license
 */
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { forwardRef, startTransition } from "react";
import { ArrowIcon, ReturnIcon } from "./icons.tsx";

export interface CommandMenuProps extends Ariakit.DialogProps {
  open?: Ariakit.DialogStoreProps["open"];
  setOpen?: Ariakit.DialogStoreProps["setOpen"];
  tab?: Ariakit.TabProviderProps["selectedId"];
  setTab?: (id: string) => void;
  defaultTab?: Ariakit.TabProviderProps["defaultSelectedId"];
  onTabChange?: (id: string) => void;
  onSearch?: Ariakit.ComboboxProviderProps["setValue"];
}

export const CommandMenu = forwardRef<HTMLDivElement, CommandMenuProps>(
  function CommandMenu(
    { open, setOpen, tab, setTab, defaultTab, onTabChange, onSearch, ...props },
    ref,
  ) {
    const dialog = Ariakit.useDialogStore({ open, setOpen: setOpen });
    return (
      <Ariakit.Dialog
        ref={ref}
        unmountOnHide
        backdrop={<div className="ak-backdrop ak-backdrop-enter" />}
        {...props}
        store={dialog}
        // dir="rtl"
        className={clsx(
          "ak-modal ak-popup ak-popup-enter ak-elevation-2 flex flex-col overflow-clip max-sm:h-auto sm:max-h-[480px] sm:w-[640px] sm:[--inset-block:72px]",
          props.className,
        )}
      >
        <Ariakit.ComboboxProvider
          disclosure={dialog}
          focusLoop={false}
          focusShift
          orientation="layout"
          // rtl
          // focusWrap="horizontal"
          resetValueOnHide
          setValue={(value) => {
            startTransition(() => {
              onSearch?.(value);
            });
          }}
        >
          <Ariakit.TabProvider
            selectedId={tab}
            defaultSelectedId={defaultTab}
            // If consumers want to control the state, they should use `setTabId`.
            // `onTabChange` is best used when they simply want to identify the
            // selected tab so they can update the content without blocking the UI.
            // This approach allows users on lower-end devices to continue
            // interacting with the UI, including switching tabs, even as the
            // content updates.
            setSelectedId={(id) => {
              if (!id) return;
              setTab?.(id);
              startTransition(() => {
                onTabChange?.(id);
              });
            }}
          >
            {props.children}
            <footer className="ak-popup-cover ak-popup-layer mt-auto flex flex-none gap-3 border-[--border] border-t p-2 text-sm">
              <div className="flex items-center gap-1">
                <kbd className="ak-kbd" aria-label="Up Arrow">
                  <ArrowIcon direction="up" />
                </kbd>
                <kbd className="ak-kbd" aria-label="Down Arrow">
                  <ArrowIcon direction="down" />
                </kbd>
                {/* <kbd className="ak-kbd" aria-label="Left Arrow">
                  <ArrowIcon direction="left" />
                </kbd>
                <kbd className="ak-kbd" aria-label="Right Arrow">
                  <ArrowIcon direction="right" />
                </kbd> */}
                to navigate
              </div>
              <div className="flex items-center gap-1">
                <kbd className="ak-kbd text-xs">Tab</kbd>
                to switch tabs
              </div>
              <div className="flex items-center gap-1">
                <kbd className="ak-kbd" aria-label="Enter">
                  <ReturnIcon />
                </kbd>
                to select
              </div>
            </footer>
          </Ariakit.TabProvider>
        </Ariakit.ComboboxProvider>
      </Ariakit.Dialog>
    );
  },
);

export interface CommandMenuInputProps extends Ariakit.ComboboxProps {}

export const CommandMenuInput = forwardRef<
  HTMLInputElement,
  CommandMenuInputProps
>(function CommandMenuInput(props, ref) {
  const tab = Ariakit.useTabContext();
  return (
    <div className="ak-popup-cover grid flex-none grid-cols-[auto_max-content] items-center border-[--border] border-b p-0 pe-[7px] sm:pe-[11px]">
      <Ariakit.Combobox
        ref={ref}
        autoSelect="always"
        {...props}
        className={clsx(
          "ak-input ak-rounded-item bg-transparent p-3 py-[14px] text-[17px] outline-none [box-shadow:none]",
          props.className,
        )}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key !== "Tab") return;
          event.preventDefault();
          const activeId = tab?.getState().selectedId;
          tab?.select(
            event.shiftKey
              ? tab.previous({ activeId })
              : tab.next({ activeId }),
          );
        }}
      />
      <Ariakit.DialogDismiss className="ak-focusable ak-clickable ak-rounded-item ak-button ak-button-small ak-button-secondary [--border:inherit]">
        Esc
      </Ariakit.DialogDismiss>
    </div>
  );
});

export interface CommandMenuTabListProps extends Ariakit.TabListProps {}

export const CommandMenuTabList = forwardRef<
  HTMLDivElement,
  CommandMenuTabListProps
>(function CommandMenuTabList(props, ref) {
  return (
    <Ariakit.TabList
      ref={ref}
      {...props}
      className={clsx("flex items-center gap-2 p-2 pt-3", props.className)}
    />
  );
});

export interface CommandMenuTabProps extends Ariakit.TabProps {}

export const CommandMenuTab = forwardRef<
  HTMLButtonElement,
  CommandMenuTabProps
>(function CommandMenuTab(props, ref) {
  return (
    <Ariakit.Tab
      ref={ref}
      accessibleWhenDisabled={false}
      {...props}
      render={<Ariakit.Role.div render={props.render} />}
      className={clsx("ak-clickable ak-tab ak-tab-chip", props.className)}
    />
  );
});

export interface CommandMenuTabPanelProps extends Ariakit.TabPanelProps {}

export const CommandMenuTabPanel = forwardRef<
  HTMLDivElement,
  CommandMenuTabPanelProps
>(function CommandMenuTabPanel(props, ref) {
  const tab = Ariakit.useTabContext();
  // We assume a single tab panel is being displayed with the `tabId` and
  // `children` props varying based on the active tab. If a `tabId` prop isn't
  // supplied, we can deduce it from the selected tab.
  const tabId = Ariakit.useStoreState(
    tab,
    (state) => props.tabId ?? state?.selectedId,
  );
  return (
    <Ariakit.TabPanel
      ref={ref}
      key={tabId}
      tabId={tabId}
      {...props}
      className={clsx(
        "ak-tab-panel ak-popup-cover flex flex-col",
        props.className,
      )}
    />
  );
});

export interface CommandMenuListProps extends Ariakit.ComboboxListProps {}

export const CommandMenuList = forwardRef<HTMLDivElement, CommandMenuListProps>(
  function CommandMenuList(props, ref) {
    return (
      <Ariakit.ComboboxList
        ref={ref}
        {...props}
        className={clsx(
          "ak-popup-cover grid grid-cols-2 overflow-auto overscroll-contain",
          props.className,
        )}
      />
    );
  },
);

export interface CommandMenuGroupProps extends Ariakit.ComboboxGroupProps {
  label?: ReactNode;
}

export const CommandMenuGroup = forwardRef<
  HTMLDivElement,
  CommandMenuGroupProps
>(function CommandMenuGroup({ label, ...props }, ref) {
  return (
    <Ariakit.ComboboxGroup
      ref={ref}
      {...props}
      className={clsx("group", props.className)}
    >
      {label && (
        <Ariakit.ComboboxGroupLabel className="group-label">
          {label}
        </Ariakit.ComboboxGroupLabel>
      )}
      {props.children}
    </Ariakit.ComboboxGroup>
  );
});

export interface CommandMenuItemProps extends Ariakit.ComboboxItemProps {}

export const CommandMenuItem = forwardRef<HTMLDivElement, CommandMenuItemProps>(
  function CommandMenuItem(props, ref) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        hideOnClick
        focusOnHover
        blurOnHoverEnd={false}
        {...props}
        className={clsx(
          "ak-option ak-clickable [--padding-block:0.5rem]",
          props.className,
        )}
      />
    );
  },
);
