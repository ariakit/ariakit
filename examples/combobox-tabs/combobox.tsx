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
  const [activeId, setActiveId] =
    React.useState<ComboboxProviderProps["activeId"]>(null);
  return (
    <Ariakit.ComboboxProvider
      {...props}
      activeId={activeId}
      setActiveId={setActiveId}
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
  return (
    <Ariakit.ComboboxPopover
      ref={ref}
      role="dialog"
      gutter={4}
      shift={-4}
      modal
      unmountOnHide
      {...props}
      className={clsx("popover", props.className)}
    >
      {props.children}
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

export interface ComboboxTabsProps extends Ariakit.TabListProps {}

export const ComboboxTabs = React.forwardRef<HTMLDivElement, ComboboxTabsProps>(
  function ComboboxTabs(props, ref) {
    return (
      <Ariakit.TabList
        ref={ref}
        focusable={false}
        {...props}
        className={clsx("tab-list", props.className)}
      />
    );
  },
);

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
        shouldRegisterItem={isSelected}
        {...props}
        className={clsx("tab", props.className)}
        render={
          <Ariakit.Tab
            render={props.render}
            accessibleWhenDisabled={false}
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
        onKeyDownCapture={(event) => {
          props.onKeyDownCapture?.(event);
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
          tab.setActiveId(tab.getState().selectedId);
          tab.select(action());
        }}
      />
    );
  },
);
