import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import { ArrowIcon, ReturnIcon } from "./icons.jsx";

export interface ComboboxProviderProps extends Ariakit.ComboboxProviderProps {
  tabId?: Ariakit.TabProviderProps["selectedId"];
  setTabId?: (id: string) => void;
  defaultTabId?: Ariakit.TabProviderProps["defaultSelectedId"];
  onSearch?: Ariakit.ComboboxProviderProps["setValue"];
  onTabChange?: (id: string) => void;
}

export function ComboboxProvider({
  tabId,
  setTabId,
  defaultTabId,
  onSearch,
  onTabChange,
  ...props
}: ComboboxProviderProps) {
  // Keep combobox and tab state in sync so moving from a tab to a combobox item
  // won't keep the tab in an active state as if it were focused.
  const [activeId, setActiveId] =
    React.useState<ComboboxProviderProps["activeId"]>(null);
  return (
    <Ariakit.ComboboxProvider
      {...props}
      activeId={activeId}
      setActiveId={setActiveId}
      // If consumers want to control the state, they should use `setValue`. If
      // a search operation is needed, `onSearch` should be used to ensure the
      // input remains responsive to user input, thanks to startTransition.
      setValue={(value) => {
        props.setValue?.(value);
        React.startTransition(() => {
          onSearch?.(value);
        });
      }}
    >
      <Ariakit.TabProvider
        includesBaseElement={false}
        activeId={activeId}
        setActiveId={setActiveId}
        selectedId={tabId}
        defaultSelectedId={defaultTabId}
        // If consumers want to control the state, they should use `setTabId`.
        // `onTabChange` is best used when they simply want to identify the
        // selected tab so they can update the content without blocking the UI.
        // This approach allows users on lower-end devices to continue
        // interacting with the UI, including switching tabs, even as the
        // content updates.
        setSelectedId={(id) => {
          if (!id) return;
          setTabId?.(id);
          React.startTransition(() => {
            onTabChange?.(id);
          });
        }}
      >
        {props.children}
      </Ariakit.TabProvider>
    </Ariakit.ComboboxProvider>
  );
}

export interface ComboboxProps extends Ariakit.ComboboxProps {}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(props, ref) {
    const combobox = Ariakit.useComboboxContext()!;
    const hasValue = combobox.useState((state) => state.value !== "");
    return (
      <div className="combobox-wrapper">
        <Ariakit.Combobox
          ref={ref}
          autoSelect
          {...props}
          className={clsx("combobox", props.className)}
          getAutoSelectId={(items) => {
            // By default, `autoSelect` will focus on the first enabled item
            // when the user types in the combobox input, which is always the
            // tab. We're tweaking this behavior so that the auto-selected item
            // is actually the first enabled item that isn't a tab.
            const firstEnabledNonTabItem = items.find((item) => {
              if (item.disabled) return false;
              return item.element?.getAttribute("role") !== "tab";
            });
            return firstEnabledNonTabItem?.id;
          }}
        />
        <div className="combobox-buttons">
          {hasValue && (
            <Ariakit.ComboboxCancel className="button secondary combobox-cancel" />
          )}
          <Ariakit.ComboboxDisclosure className="button flat combobox-disclosure" />
        </div>
      </div>
    );
  },
);

export interface ComboboxPopoverProps extends Ariakit.ComboboxPopoverProps {
  children?: React.ReactNode;
}

export const ComboboxPopover = React.forwardRef<
  HTMLDivElement,
  ComboboxPopoverProps
>(function ComboboxPopover(props, ref) {
  const combobox = Ariakit.useComboboxContext()!;
  const isInputActive = combobox.useState((state) => state.activeId === null);
  // React.useDeferredValue helps in maintaining a responsive UI during the
  // mounting of the popover.
  const mounted = React.useDeferredValue(combobox.useState("mounted"));
  return (
    <Ariakit.ComboboxPopover
      ref={ref}
      // By default, the combobox popover is assigned the role of "listbox".
      // However, as we're rendering tabs within it, we need to modify the role
      // to "dialog". The listbox will be rendered as part of the tab panel.
      role="dialog"
      // By rendering the combobox as a modal, we prevent users from
      // unintentionally closing the popover when they hit Tab before
      // understanding that they should use arrow keys.
      modal
      gutter={4}
      shift={-4}
      unmountOnHide
      hidden={!mounted}
      {...props}
      className={clsx("popover", props.className)}
    >
      {mounted && props.children}
      <div className="popover-footer">
        <div className="shortcut">
          <kbd className="kbd" aria-label="Up Arrow">
            <ArrowIcon direction="up" />
          </kbd>
          <kbd className="kbd" aria-label="Down Arrow">
            <ArrowIcon direction="down" />
          </kbd>
          to navigate
        </div>
        {!isInputActive && (
          <div className="shortcut">
            <kbd className="kbd" aria-label="Left Arrow">
              <ArrowIcon direction="left" />
            </kbd>
            <kbd className="kbd" aria-label="Right Arrow">
              <ArrowIcon direction="right" />
            </kbd>
            to switch tabs
          </div>
        )}
        {!isInputActive && (
          <div className="shortcut">
            <kbd className="kbd" aria-label="Enter">
              <ReturnIcon />
            </kbd>
            to select
          </div>
        )}
      </div>
    </Ariakit.ComboboxPopover>
  );
});

export interface ComboboxTabListProps extends Ariakit.TabListProps {}

export const ComboboxTabList = React.forwardRef<
  HTMLDivElement,
  ComboboxTabListProps
>(function ComboboxTabList(props, ref) {
  return (
    <Ariakit.TabList
      ref={ref}
      focusable={false}
      {...props}
      className={clsx("tab-list", props.className)}
    />
  );
});

export interface ComboboxTabProps extends Ariakit.ComboboxItemProps {}

export const ComboboxTab = React.forwardRef<HTMLDivElement, ComboboxTabProps>(
  function ComboboxTab({ disabled, ...props }, ref) {
    const tab = Ariakit.useTabContext()!;
    const defaultId = React.useId();
    const id = props.id ?? defaultId;
    const isSelected = tab.useState((state) => state.selectedId === id);
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        id={id}
        role="tab"
        // Only the selected tab should be registered as a combobox item. The
        // remaining tabs will continue to be registered as tabs, but they won't
        // be part of the combobox widget's focus order when using the up and
        // down arrow keys.
        shouldRegisterItem={isSelected}
        {...props}
        className={clsx("tab", props.className)}
        render={
          <Ariakit.Tab
            render={props.render}
            accessibleWhenDisabled={false}
            // When a tab is selected and there are no results, we can't allow
            // it to be disabled. Users must still be able to focus on it and
            // navigate to other enabled tabs. However, we can safely disable
            // tabs that aren't selected.
            disabled={isSelected ? false : disabled}
          />
        }
      />
    );
  },
);

export interface ComboboxPanelProps extends Ariakit.TabPanelProps {
  children?: React.ReactNode;
}

export const ComboboxPanel = React.forwardRef<
  HTMLDivElement,
  ComboboxPanelProps
>(function ComboboxTabPanel(props, ref) {
  const tab = Ariakit.useTabContext()!;
  // We assume a single tab panel is being displayed with the `tabId` and
  // `children` props varying based on the active tab. If a `tabId` prop isn't
  // supplied, we can deduce it from the selected tab.
  const tabId = tab.useState((state) => props.tabId ?? state.selectedId);
  return (
    <Ariakit.TabPanel
      ref={ref}
      tabId={tabId}
      focusable={false}
      {...props}
      className={clsx("tab-panel", props.className)}
    >
      <div role="listbox" className="listbox">
        {props.children}
      </div>
    </Ariakit.TabPanel>
  );
});

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    const tab = Ariakit.useTabContext()!;
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        role="option"
        focusOnHover
        blurOnHoverEnd={false}
        {...props}
        className={clsx("combobox-item", props.className)}
        // Custom onKeyDown handler enables users to switch between tabs using
        // arrow keys when a combobox item is active.
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const keyMap = {
            ArrowLeft: tab.previous,
            ArrowRight: tab.next,
            Home: tab.first,
            End: tab.last,
          };
          const action = keyMap[event.key as keyof typeof keyMap];
          if (!action) return;
          event.preventDefault();
          // Since we're syncing the activeId state of the tab and combobox, the
          // activeId of the tab will refer to the id of the combobox item, not
          // the selected tab. We must first set the selected tab as the active
          // id. This ensures that calling tab.previous() and tab.next()
          // operates correctly from the selected tab.
          tab.setActiveId(tab.getState().selectedId);
          tab.select(action());
        }}
      />
    );
  },
);
