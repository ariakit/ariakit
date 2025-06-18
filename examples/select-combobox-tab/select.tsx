/**
 * @license
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.org/plus/license
 */
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";

export interface SelectProps extends Ariakit.SelectProps {
  icon?: React.ReactNode;
  text?: React.ReactNode;
  value?: Ariakit.SelectProviderProps<string>["value"];
  setValue?: Ariakit.SelectProviderProps<string>["setValue"];
  defaultValue?: Ariakit.SelectProviderProps<string>["defaultValue"];
  tab?: Ariakit.TabProviderProps["selectedId"];
  setTab?: Ariakit.TabProviderProps["setSelectedId"];
  defaultTab?: Ariakit.TabProviderProps["defaultSelectedId"];
  selectTabOnMove?: boolean;
  label?: string | Ariakit.SelectLabelProps["render"];
  heading?: string | Ariakit.PopoverHeadingProps["render"];
  combobox?: Ariakit.ComboboxProps["render"];
  onSearch?: (value: string) => void;
}

export function Select({
  children,
  icon,
  text,
  value,
  setValue,
  defaultValue,
  tab,
  setTab,
  defaultTab,
  selectTabOnMove,
  label,
  heading,
  combobox,
  onSearch,
  ...props
}: SelectProps) {
  const searchable = !!combobox || !!onSearch;

  const select = (
    <Ariakit.SelectProvider
      virtualFocus={searchable}
      value={value}
      setValue={setValue}
      defaultValue={defaultValue}
    >
      {label && (
        <Ariakit.SelectLabel
          render={typeof label === "string" ? <div>{label}</div> : label}
        />
      )}
      <Ariakit.Select
        {...props}
        className={clsx("ak-button ak-button-default", props.className)}
      >
        {icon}
        <div className="truncate">{text || <Ariakit.SelectValue />}</div>
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover
        gutter={5}
        shift={-4}
        unmountOnHide
        className="ak-popup ak-popup-enter ak-elevation-1 ak-popover flex flex-col overflow-clip gap-px"
      >
        {(heading || searchable) && (
          <div className="flex flex-col gap-2">
            {heading && (
              <div className="grid grid-cols-[auto_max-content] items-center gap-2 ps-[13px]">
                <Ariakit.SelectHeading
                  className="cursor-default font-medium opacity-80"
                  render={
                    typeof heading === "string" ? <div>{heading}</div> : heading
                  }
                />
                <Ariakit.SelectDismiss className="ak-rounded-item ak-button ak-button-secondary ak-button-flat ak-button-icon ak-button-small opacity-70" />
              </div>
            )}
            {searchable && (
              <Ariakit.Combobox
                autoSelect
                render={combobox}
                className="ak-combobox h-10 w-full px-[13px]"
              />
            )}
          </div>
        )}
        <Ariakit.TabProvider
          selectedId={tab}
          setSelectedId={setTab}
          defaultSelectedId={defaultTab}
          selectOnMove={selectTabOnMove}
        >
          <div className="ak-popup-cover flex flex-col">{children}</div>
        </Ariakit.TabProvider>
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );

  if (searchable) {
    return (
      <Ariakit.ComboboxProvider
        resetValueOnHide
        setValue={(value) => {
          React.startTransition(() => {
            onSearch?.(value);
          });
        }}
      >
        {select}
      </Ariakit.ComboboxProvider>
    );
  }

  return select;
}

export interface SelectTabListProps extends Ariakit.TabListProps {}

export function SelectTabList(props: SelectTabListProps) {
  return (
    <Ariakit.TabList
      {...props}
      className={clsx(
        "ak-tab-list ak-tab-border ak-popup-cover",
        props.className,
      )}
    />
  );
}

export interface SelectTabProps extends Ariakit.TabProps {}

export function SelectTab(props: SelectTabProps) {
  return (
    <Ariakit.Tab
      {...props}
      render={<Ariakit.Role.div render={props.render} />}
      className={clsx("ak-tab ak-tab-folder", props.className)}
    />
  );
}

export interface SelectTabPanelProps extends Ariakit.TabPanelProps {}

export function SelectTabPanel(props: SelectTabPanelProps) {
  const tab = Ariakit.useTabContext();
  const tabId = Ariakit.useStoreState(
    tab,
    (state) => props.tabId || state?.selectedId,
  );
  return (
    <Ariakit.TabPanel
      key={tabId}
      tabId={tabId}
      unmountOnHide
      {...props}
      className={clsx(
        "ak-tab-panel ak-popup-layer ak-popup-cover flex flex-col",
        props.className,
      )}
    />
  );
}

export interface SelectListProps
  extends Omit<Ariakit.SelectListProps, "store"> {}

export function SelectList(props: SelectListProps) {
  const combobox = Ariakit.useComboboxContext();
  const Component = combobox ? Ariakit.ComboboxList : Ariakit.SelectList;
  return (
    <Component
      {...props}
      className={clsx(
        "ak-popup-cover ak-popup-scroll outline-none",
        props.className,
      )}
    />
  );
}

export interface SelectItemProps extends Ariakit.SelectItemProps {
  icon?: React.ReactNode;
}

export function SelectItem({
  icon = <Ariakit.SelectItemCheck />,
  ...props
}: SelectItemProps) {
  const combobox = Ariakit.useComboboxContext();
  const render = combobox ? (
    <Ariakit.ComboboxItem render={props.render} />
  ) : undefined;
  return (
    <Ariakit.SelectItem
      {...props}
      render={render}
      blurOnHoverEnd={false}
      className={clsx(
        "ak-option [--padding-block:0.5rem] sm:[--padding-block:0.25rem]",
        props.className,
      )}
    >
      {icon}
      <div className="truncate">{props.children || props.value}</div>
    </Ariakit.SelectItem>
  );
}

export interface SelectSeparatorProps extends React.ComponentProps<"div"> {}

export function SelectSeparator(props: SelectSeparatorProps) {
  return (
    <div
      {...props}
      className={clsx(
        "ak-popup-cover my-[--padding] h-px bg-[--border] p-0",
        props.className,
      )}
    />
  );
}
