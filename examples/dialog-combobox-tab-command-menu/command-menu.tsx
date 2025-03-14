/**
 * @license
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.org/plus/license
 */
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  forwardRef,
  startTransition,
  useContext,
  useId,
} from "react";
import { ArrowIcon, ReturnIcon } from "./icons.tsx";

const CommandMenuGridColsContext = createContext(0);
const CommandMenuGroupContext = createContext<string | undefined>(undefined);

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
        className={clsx(
          "ak-modal ak-popup ak-popup-enter ak-elevation-2 flex flex-col overflow-clip max-sm:h-auto sm:max-h-[480px] sm:w-[640px] sm:[--inset-block:72px]",
          props.className,
        )}
      >
        <Ariakit.ComboboxProvider
          disclosure={dialog}
          focusLoop={false}
          focusShift
          focusWrap="horizontal"
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
            // If consumers want to control the state, they should use
            // `setTabId`. `onTabChange` is best used when they simply want to
            // identify the selected tab so they can update the content without
            // blocking the UI. This approach allows users on lower-end devices
            // to continue interacting with the UI, including switching tabs,
            // even as the content updates.
            setSelectedId={(id) => {
              if (!id) return;
              setTab?.(id);
              startTransition(() => {
                onTabChange?.(id);
              });
            }}
          >
            {props.children}
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
          // Tab key navigation across tabs
          props.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key !== "Tab") return;
          const activeId = tab?.getState().selectedId;
          // Ensure the selected tab is recognized as the active (focused) tab
          // before switching to the next or previous tab. This is because the
          // actual focus might be on an option or another tab when using manual
          // activation. It also disables the focus loop, allowing users to exit
          // the tab list when they reach the end. Passing options to the `next`
          // or `previous` functions only affects that specific call and doesn't
          // change the tab state.
          const options = { activeId, focusLoop: false };
          const nextId = event.shiftKey
            ? tab?.previous(options)
            : tab?.next(options);
          if (!nextId) return;
          event.preventDefault();
          tab?.select(nextId);
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
      className={clsx(
        "ak-tab-list ak-popup-cover flex gap-2 p-2 pt-3",
        props.className,
      )}
    />
  );
});

export interface CommandMenuTabProps extends Ariakit.TabProps {}

export const CommandMenuTab = forwardRef<
  HTMLButtonElement,
  CommandMenuTabProps
>(function CommandMenuTab(props, ref) {
  // Automatically sets the `rowId` prop if the tab is part of a multi-column
  // grid layout. This ensures the tab is recognized within the grid when
  // navigating with arrow keys.
  const combobox = Ariakit.useComboboxContext();
  const isGrid = Ariakit.useStoreState(
    combobox,
    (state) => !!state?.items.find((item) => !!item.rowId),
  );
  const rowId = isGrid ? "tabs" : undefined;
  return (
    <Ariakit.Tab
      ref={ref}
      rowId={rowId}
      accessibleWhenDisabled={false}
      {...props}
      render={<Ariakit.Role.div render={props.render} />}
      className={clsx("ak-tab-chip", props.className)}
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
  function CommandMenuList({ children, ...props }, ref) {
    const combobox = Ariakit.useComboboxContext();
    const value = Ariakit.useStoreState(combobox, (state) => state?.value);

    const hasChildren = Array.isArray(children)
      ? !!children.length
      : !!children;

    return (
      <Ariakit.ComboboxList
        ref={ref}
        {...props}
        className={clsx("ak-popup-cover ak-popup-scroll", props.className)}
      >
        {hasChildren ? (
          children
        ) : (
          <div className="my-10 text-center">
            No pages found
            {!!value && (
              <>
                {" "}
                for &quot;<strong>{value}</strong>
              </>
            )}
            &quot;
          </div>
        )}
      </Ariakit.ComboboxList>
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
  const defaultId = useId();
  const id = props.id ?? defaultId;
  return (
    <Ariakit.ComboboxGroup
      ref={ref}
      id={id}
      {...props}
      className={clsx("group", props.className)}
    >
      {label && (
        <Ariakit.ComboboxGroupLabel className="ak-popup-sticky-header ak-popup-cover border-none">
          {label}
        </Ariakit.ComboboxGroupLabel>
      )}
      <CommandMenuGroupContext.Provider value={id}>
        {props.children}
      </CommandMenuGroupContext.Provider>
    </Ariakit.ComboboxGroup>
  );
});

export interface CommandMenuGridProps extends ComponentProps<"div"> {
  cols?: number;
}

export const CommandMenuGrid = forwardRef<HTMLDivElement, CommandMenuGridProps>(
  function CommandMenuGrid({ cols = 2, ...props }, ref) {
    return (
      <CommandMenuGridColsContext.Provider value={cols}>
        <div
          ref={ref}
          {...props}
          style={{ "--grid-cols": cols } as React.CSSProperties}
          className={clsx(
            "grid grid-cols-[repeat(var(--grid-cols),minmax(0,1fr))] ak-popup-cover",
            props.className,
          )}
        />
      </CommandMenuGridColsContext.Provider>
    );
  },
);

export interface CommandMenuItemProps extends Ariakit.ComboboxItemProps {
  index?: number;
}

function getRowId(cols: number, index?: number, prefix?: string) {
  if (cols === 1) return;
  if (index == null) return;
  const row = Math.ceil((index + 1) / cols);
  return prefix ? `${prefix}/${row}` : `${row}`;
}

export const CommandMenuItem = forwardRef<HTMLDivElement, CommandMenuItemProps>(
  function CommandMenuItem({ index, ...props }, ref) {
    const cols = useContext(CommandMenuGridColsContext);
    const group = useContext(CommandMenuGroupContext);
    const rowId = getRowId(cols, index, group);
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        hideOnClick
        focusOnHover
        blurOnHoverEnd={false}
        rowId={rowId}
        {...props}
        className={clsx("ak-option [--padding-block:0.5rem]", props.className)}
      />
    );
  },
);

export interface CommandMenuFooterProps extends ComponentProps<"footer"> {}

export const CommandMenuFooter = forwardRef<
  HTMLDivElement,
  CommandMenuFooterProps
>(function CommandMenuFooter(props, ref) {
  const combobox = Ariakit.useComboboxContext();
  const tab = Ariakit.useTabContext();
  const isGrid = Ariakit.useStoreState(combobox, (state) =>
    state?.items.find((item) => !!item.rowId),
  );
  const hasTabs = Ariakit.useStoreState(tab, (state) => !!state?.selectedId);
  return (
    <footer
      ref={ref}
      {...props}
      className={clsx(
        props.className,
        "ak-popup-cover ak-popup-layer mt-auto flex flex-none gap-3 border-[--border] border-t p-2 text-sm whitespace-nowrap overflow-x-auto max-sm:hidden",
      )}
    >
      <div className="flex items-center gap-1">
        <kbd className="ak-kbd" aria-label="Up Arrow">
          <ArrowIcon direction="up" />
        </kbd>
        <kbd className="ak-kbd" aria-label="Down Arrow">
          <ArrowIcon direction="down" />
        </kbd>
        {isGrid && (
          <>
            <kbd className="ak-kbd" aria-label="Left Arrow">
              <ArrowIcon direction="left" />
            </kbd>
            <kbd className="ak-kbd" aria-label="Right Arrow">
              <ArrowIcon direction="right" />
            </kbd>
          </>
        )}
        to navigate
      </div>
      {hasTabs && (
        <div className="flex items-center gap-1">
          <kbd className="ak-kbd text-xs">Tab</kbd>
          to switch tabs
        </div>
      )}
      <div className="flex items-center gap-1">
        <kbd className="ak-kbd" aria-label="Enter">
          <ReturnIcon />
        </kbd>
        to select
      </div>
    </footer>
  );
});
