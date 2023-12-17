import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import invariant from "tiny-invariant";

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
  return (
    <Ariakit.ComboboxProvider focusWrap={false} focusLoop="vertical" {...props}>
      <Ariakit.TabProvider
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
            if (item.element?.dataset.tab) return false;
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

export interface ComboboxPopoverProps extends Ariakit.ComboboxPopoverProps {}

export const ComboboxPopover = React.forwardRef<
  HTMLDivElement,
  ComboboxPopoverProps
>(function ComboboxPopover(props, ref) {
  return (
    <Ariakit.ComboboxPopover
      ref={ref}
      role="dialog"
      {...props}
      className={clsx("popover", props.className)}
    />
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
      />
    );
  },
);

export interface ComboboxTabProps extends Ariakit.ComboboxItemProps {
  children?: React.ReactNode;
}

export const ComboboxTab = React.forwardRef<HTMLDivElement, ComboboxTabProps>(
  function ComboboxTab(props, ref) {
    const tab = Ariakit.useTabContext();
    invariant(tab);
    const defaultId = React.useId();
    const id = props.id ?? defaultId;
    const isSelected = tab.useState((state) => state.selectedId === id);
    // const isPrevious = tab.useState(() => !isSelected && tab.previous() === id);
    // const isNext = tab.useState(() => !isSelected && tab.next() === id);
    const isFirst = tab.useState(() => tab.first() === id);
    const isLast = tab.useState(() => tab.last() === id);
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        id={id}
        rowId={id}
        shouldRegisterItem={isSelected}
        {...props}
        data-tab
        className={clsx("tab", props.className)}
        render={<Ariakit.Tab render={props.render} />}
      >
        {isFirst && <kbd>Home</kbd>}
        {props.children}
        {isLast && <kbd>End</kbd>}
      </Ariakit.ComboboxItem>
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
        {...props}
        id={id}
        rowId={id}
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
          tab.select(action());
        }}
      />
    );
  },
);
