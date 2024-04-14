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
        className="popup elevation-1 popover-enter flex flex-col gap-1 bg-[--popup-background] [--popup-background:--background] has-[[data-tab]]:[--popup-background:oklch(from_var(--background)_calc(l-0.04)_c_h)]"
      >
        {heading && (
          <div className="flex items-center gap-2 ps-2">
            <Ariakit.SelectHeading
              className="flex-1 cursor-default font-medium opacity-70"
              render={heading}
            />
            <Ariakit.SelectDismiss className="focusable clickable rounded-item button button-secondary button-flat button-icon button-small" />
          </div>
        )}
        {searchable && (
          <Ariakit.Combobox
            autoSelect
            render={combobox}
            data-tab
            className="focusable combobox input rounded-item h-10 w-full px-2 [--background:--popup-background]"
          />
        )}
        {children}
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

export interface SelectListProps extends Ariakit.SelectListProps {}

export function SelectList(props: SelectListProps) {
  return (
    <Ariakit.SelectList
      {...props}
      className={clsx("select-combobox-tab-list", props.className)}
    />
  );
}

export interface SelectItemProps extends Ariakit.SelectItemProps {}

export function SelectItem(props: SelectItemProps) {
  const combobox = Ariakit.useComboboxContext();
  return (
    <Ariakit.SelectItem
      {...props}
      blurOnHoverEnd={false}
      className={clsx(
        "option clickable grid grid-cols-[1rem_auto_1rem] items-center [--padding-block:0.5rem] sm:[--padding-block:0.25rem]",
        props.className,
      )}
      render={
        combobox ? <Ariakit.ComboboxItem render={props.render} /> : undefined
      }
    >
      <Ariakit.SelectItemCheck />
      {props.children || props.value}
    </Ariakit.SelectItem>
  );
}
