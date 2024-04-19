import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { SelectValue } from "@ariakit/react-core/select/select-value";
import clsx from "clsx";

export interface SelectProps extends Ariakit.SelectProps {
  icon?: React.ReactNode;
  text?: React.ReactNode;
  value?: Ariakit.SelectProviderProps<string>["value"];
  setValue?: Ariakit.SelectProviderProps<string>["setValue"];
  defaultValue?: Ariakit.SelectProviderProps<string>["defaultValue"];
  tab?: Ariakit.TabProviderProps["selectedId"];
  setTab?: Ariakit.TabProviderProps["setSelectedId"];
  defaultTab?: Ariakit.TabProviderProps["defaultSelectedId"];
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
        className={clsx(
          "focusable clickable button button-default",
          props.className,
        )}
      >
        {icon}
        <div className="truncate">{text || <SelectValue />}</div>
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover
        gutter={5}
        shift={-4}
        unmountOnHide
        className="popup elevation-1 popover popover-enter flex flex-col gap-[9px] overflow-clip"
      >
        {heading && (
          <div className="grid grid-cols-[auto_max-content] items-center gap-2 ps-[13px]">
            <Ariakit.SelectHeading
              className="cursor-default font-medium opacity-80"
              render={
                typeof heading === "string" ? <div>{heading}</div> : heading
              }
            />
            <Ariakit.SelectDismiss className="focusable clickable rounded-item button button-secondary button-flat button-icon button-small opacity-70" />
          </div>
        )}
        {searchable && (
          <Ariakit.Combobox
            autoSelect
            render={combobox}
            className="focusable combobox input rounded-item -mb-1 h-10 w-full px-[13px] has-[~*_[data-tab]]:mb-0"
          />
        )}
        <Ariakit.TabProvider
          selectedId={tab}
          setSelectedId={setTab}
          defaultSelectedId={defaultTab}
        >
          <div className="tabs-border popup-cover flex flex-col">
            {children}
          </div>
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
  return <Ariakit.TabList {...props} />;
}

export interface SelectTabProps extends Ariakit.TabProps {}

export function SelectTab(props: SelectTabProps) {
  return (
    <Ariakit.Tab
      {...props}
      data-tab
      render={<Ariakit.Role.div render={props.render} />}
      className={clsx("clickable tab tab-default", props.className)}
    />
  );
}

export interface SelectTabPanelProps extends Ariakit.TabPanelProps {}

export function SelectTabPanel(props: SelectTabPanelProps) {
  const tab = Ariakit.useTabContext()!;
  const tabId = tab.useState((state) => props.tabId || state.selectedId);
  return (
    <Ariakit.TabPanel
      key={tabId}
      tabId={tabId}
      unmountOnHide
      {...props}
      className={clsx(
        "popup-layer popup-cover flex flex-col pt-[calc(var(--padding)*2)]",
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
        "tab-panel popup-cover overflow-auto overscroll-contain outline-none",
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
      data-option
      render={render}
      blurOnHoverEnd={false}
      className={clsx(
        "option clickable [--padding-block:0.5rem] sm:[--padding-block:0.25rem]",
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
        "popup-cover my-[--padding] h-px bg-[--border] p-0",
        props.className,
      )}
    />
  );
}
