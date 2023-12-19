import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import invariant from "tiny-invariant";
import { ArrowIcon, ReturnIcon } from "./icons.jsx";

const PendingSearchContext = React.createContext(false);
const PendingTabContext = React.createContext(false);

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
  const [searchPending, startSearchTransition] = React.useTransition();
  const [tabPending, startTabTransition] = React.useTransition();
  const [activeId, setActiveId] = React.useState<string | null | undefined>(
    null,
  );
  return (
    <Ariakit.ComboboxProvider
      activeId={activeId}
      setActiveId={setActiveId}
      {...props}
      setValue={(value) => {
        props.setValue?.(value);
        startSearchTransition(() => {
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
          startTabTransition(() => {
            onTabChange?.(id);
          });
        }}
      >
        <PendingSearchContext.Provider value={searchPending}>
          <PendingTabContext.Provider value={tabPending}>
            {props.children}
          </PendingTabContext.Provider>
        </PendingSearchContext.Provider>
      </Ariakit.TabProvider>
    </Ariakit.ComboboxProvider>
  );
}

export interface ComboboxProps extends Ariakit.ComboboxProps {}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(props, ref) {
    const combobox = Ariakit.useComboboxContext();
    invariant(combobox);
    const isActive = combobox.useState((state) => state.activeId === null);
    const hasValue = combobox.useState((state) => state.value !== "");
    return (
      <div className="combobox-wrapper">
        <Ariakit.Combobox
          ref={ref}
          autoSelect
          {...props}
          data-active={isActive || undefined}
          className={clsx("combobox", props.className)}
          onAutoSelect={(event) => {
            props.onAutoSelect?.(event);
            if (event.defaultPrevented) return;
            if (!combobox) return;
            const { renderedItems } = combobox.getState();
            const item = renderedItems.find((item) => {
              if (item.disabled) return false;
              if (item.element?.getAttribute("role") === "tab") return false;
              return true;
            });
            if (!item) return;
            event.preventDefault();
            item.element?.focus();
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
  const combobox = Ariakit.useComboboxContext();
  invariant(combobox);
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
          <div className="shortcut switch-tabs">
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
          <div className="shortcut enter-to-select">
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
    const tab = Ariakit.useTabContext();
    invariant(tab);
    const defaultId = React.useId();
    const id = props.id ?? defaultId;
    const isSelected = tab.useState((state) => state.selectedId === id);
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        id={id}
        // rowId={id}
        role="tab"
        shouldRegisterItem={isSelected}
        {...props}
        className={clsx("tab", props.className)}
        // moveOnKeyPress={(event) => {
        //   return event.key !== "ArrowRight" && event.key !== "ArrowLeft";
        // }}
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
  const searchPending = React.useContext(PendingSearchContext);
  const tabPending = React.useContext(PendingTabContext);
  const tab = Ariakit.useTabContext();
  invariant(tab);

  const isSinglePanel = tab.panels.useState(
    (state) => state.renderedItems.length < 2,
  );

  const tabId = tab.useState((state) => {
    if (props.tabId) return props.tabId;
    if (!isSinglePanel) return;
    return state.selectedId;
  });

  return (
    <Ariakit.TabPanel
      ref={ref}
      focusable={false}
      aria-busy={searchPending || tabPending}
      {...props}
      tabId={tabId}
      className={clsx("tab-panel", props.className)}
      render={(props) => (
        <div {...props}>{!props.hidden && props.children}</div>
      )}
    >
      <div role="listbox" className="listbox">
        {props.children}
      </div>
    </Ariakit.TabPanel>
  );
});

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {
  children?: React.ReactNode;
}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    const tab = Ariakit.useTabContext();
    const defaultId = React.useId();
    const id = props.id ?? defaultId;
    return (
      <Ariakit.ComboboxItem
        key="item"
        ref={ref}
        role="option"
        id={id}
        // rowId={id}
        focusOnHover
        blurOnHoverEnd={false}
        {...props}
        className={clsx("combobox-item", props.className)}
        onKeyDownCapture={(event) => {
          props.onKeyDownCapture?.(event);
          if (event.defaultPrevented) return;
          if (!tab) return;
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
