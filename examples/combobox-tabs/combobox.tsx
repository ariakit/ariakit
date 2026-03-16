/**
 * @license
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.org/plus/license
 */
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import { ArrowIcon, ReturnIcon } from "./icons.tsx";

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
  return (
    <Ariakit.ComboboxProvider
      {...props}
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
    return (
      <div className="combobox-wrapper">
        <Ariakit.Combobox
          ref={ref}
          autoSelect
          {...props}
          className={clsx("combobox", props.className)}
        />
        <div className="combobox-buttons">
          <Ariakit.ComboboxCancel
            hideWhenEmpty
            className="button secondary combobox-cancel"
          />
          <Ariakit.ComboboxDisclosure className="button flat combobox-disclosure" />
        </div>
      </div>
    );
  },
);

export interface ComboboxPopoverProps extends Ariakit.ComboboxPopoverProps {}

export const ComboboxPopover = React.forwardRef<
  HTMLDivElement,
  ComboboxPopoverProps
>(function ComboboxPopover(props, ref) {
  const combobox = Ariakit.useComboboxContext();
  const isInputActive = Ariakit.useStoreState(
    combobox,
    (state) => state?.activeId === null,
  );
  // React.useDeferredValue helps in maintaining a responsive UI during the
  // mounting of the popover.
  const mounted = React.useDeferredValue(
    Ariakit.useStoreState(combobox, "mounted"),
  );
  return (
    <Ariakit.ComboboxPopover
      ref={ref}
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
      {...props}
      className={clsx("tab-list", props.className)}
    />
  );
});

export interface ComboboxTabProps extends Ariakit.TabProps {}

export const ComboboxTab = React.forwardRef<
  HTMLButtonElement,
  ComboboxTabProps
>(function ComboboxTab(props, ref) {
  return (
    <Ariakit.Tab
      ref={ref}
      accessibleWhenDisabled={false}
      {...props}
      className={clsx("tab", props.className)}
    />
  );
});

export interface ComboboxPanelProps extends Ariakit.TabPanelProps {}

export const ComboboxPanel = React.forwardRef<
  HTMLDivElement,
  ComboboxPanelProps
>(function ComboboxTabPanel(props, ref) {
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
      tabId={tabId}
      {...props}
      className={clsx("tab-panel", props.className)}
    >
      <Ariakit.ComboboxList className="listbox">
        {props.children}
      </Ariakit.ComboboxList>
    </Ariakit.TabPanel>
  );
});

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        focusOnHover
        blurOnHoverEnd={false}
        {...props}
        className={clsx("combobox-item", props.className)}
      />
    );
  },
);
