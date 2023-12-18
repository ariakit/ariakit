import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import invariant from "tiny-invariant";
import { ArrowIcon, ReturnIcon } from "./icons.jsx";

export interface ComboboxProviderProps extends Ariakit.ComboboxProviderProps {
  selectedId?: Ariakit.TabProviderProps["selectedId"];
  setSelectedId?: Ariakit.TabProviderProps["setSelectedId"];
  defaultSelectedId?: Ariakit.TabProviderProps["defaultSelectedId"];
}

export function ComboboxProvider({
  selectedId,
  setSelectedId,
  defaultSelectedId,
  ...props
}: ComboboxProviderProps) {
  const [activeId, setActiveId] = React.useState<string | null | undefined>(
    null,
  );
  return (
    <Ariakit.ComboboxProvider
      activeId={activeId}
      setActiveId={setActiveId}
      focusWrap={false}
      focusLoop="vertical"
      {...props}
    >
      <Ariakit.TabProvider
        focusLoop="horizontal"
        includesBaseElement={false}
        activeId={activeId}
        setActiveId={setActiveId}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        defaultSelectedId={defaultSelectedId}
      >
        {props.children}
      </Ariakit.TabProvider>
    </Ariakit.ComboboxProvider>
  );
}

export interface ComboboxProps extends Ariakit.ComboboxProps {}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(props, ref) {
    const combobox = Ariakit.useComboboxContext();
    return (
      <Ariakit.Combobox
        ref={ref}
        autoSelect
        {...props}
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
  return (
    <Ariakit.ComboboxPopover
      ref={ref}
      role="dialog"
      gutter={4}
      shift={-4}
      {...props}
      className={clsx("popover", props.className)}
    >
      {props.children}
      <div className="popover-footer">
        <div className="shortcut">
          <kbd className="kbd" aria-label="Enter">
            <ReturnIcon />
          </kbd>
          to select
        </div>
        <div className="shortcut">
          <kbd className="kbd" aria-label="Up Arrow">
            <ArrowIcon direction="up" />
          </kbd>
          <kbd className="kbd" aria-label="Down Arrow">
            <ArrowIcon direction="down" />
          </kbd>
          to navigate
        </div>
        <div className="shortcut">
          <kbd className="kbd" aria-label="Left Arrow">
            <ArrowIcon direction="left" />
          </kbd>
          <kbd className="kbd" aria-label="Right Arrow">
            <ArrowIcon direction="right" />
          </kbd>
          to switch tabs
        </div>
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
        {...props}
        className={clsx("tab-list", props.className)}
        render={<Ariakit.ComboboxRow render={props.render} />}
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
  return (
    <Ariakit.TabPanel
      ref={ref}
      {...props}
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

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    const tab = Ariakit.useTabContext();
    const defaultId = React.useId();
    const id = props.id ?? defaultId;
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        id={id}
        rowId={id}
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
