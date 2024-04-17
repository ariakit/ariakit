import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface SelectProps extends Ariakit.SelectProps {
  value?: Ariakit.SelectProviderProps<string>["value"];
  setValue?: Ariakit.SelectProviderProps<string>["setValue"];
  defaultValue?: Ariakit.SelectProviderProps<string>["defaultValue"];
  label?: Ariakit.SelectLabelProps["render"];
  heading?: Ariakit.PopoverHeadingProps["render"];
  combobox?: Ariakit.ComboboxProps["render"];
  onSearch?: (value: string) => void;
}

export function Select({
  children,
  value,
  setValue,
  defaultValue,
  label,
  heading,
  combobox,
  onSearch,
  ...props
}: SelectProps) {
  const searchable = !!combobox || !!onSearch;

  const select = (
    <Ariakit.SelectProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue}
    >
      {label && <Ariakit.SelectLabel render={label} />}
      <Ariakit.Select
        {...props}
        className={clsx(
          "focusable clickable button button-default",
          props.className,
        )}
      />
      <Ariakit.SelectPopover
        gutter={5}
        shift={-4}
        unmountOnHide
        className="popup elevation-1 popover popover-enter flex flex-col gap-[9px] overflow-clip"
      >
        {heading && (
          <div className="grid grid-cols-[auto_max-content] items-center gap-2 ps-2">
            <Ariakit.SelectHeading
              className="cursor-default font-medium opacity-80"
              render={heading}
            />
            <Ariakit.SelectDismiss className="focusable clickable rounded-item button button-secondary button-flat button-icon button-small opacity-70" />
          </div>
        )}
        {searchable && (
          <Ariakit.Combobox
            autoSelect
            render={combobox}
            className="focusable combobox input rounded-item -mb-1 h-10 w-full px-2 has-[~*_[data-tab]]:mb-0"
          />
        )}
        <Ariakit.TabProvider>
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
  const selectedId = tab.useState("selectedId");
  return (
    <Ariakit.TabPanel
      tabId={selectedId}
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

export interface SelectItemProps extends Ariakit.SelectItemProps {}

export function SelectItem(props: SelectItemProps) {
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
        "option clickable grid grid-cols-[1rem_auto_1rem] items-center [--padding-block:0.5rem] sm:[--padding-block:0.25rem]",
        props.className,
      )}
    >
      <Ariakit.SelectItemCheck />
      {props.children || props.value}
    </Ariakit.SelectItem>
  );
}
