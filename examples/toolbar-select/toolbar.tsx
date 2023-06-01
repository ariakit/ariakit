import * as React from "react";
import * as Ariakit from "@ariakit/react";

/* Toolbar */

export type ToolbarProps = React.ComponentPropsWithoutRef<"div">;

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  function Toolbar(props, ref) {
    const toolbar = Ariakit.useToolbarStore();
    return (
      <Ariakit.Toolbar
        ref={ref}
        store={toolbar}
        className="toolbar"
        {...props}
      />
    );
  }
);

/* ToolbarButton */

export type ToolbarButtonProps = React.ComponentPropsWithoutRef<"button">;

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(function ToolbarButton(props, ref) {
  return <Ariakit.ToolbarItem ref={ref} className="button" {...props} />;
});

/* ToolbarSeparator */

export type ToolbarSeparatorProps = React.ComponentPropsWithoutRef<"hr">;

export const ToolbarSeparator = React.forwardRef<
  HTMLHRElement,
  ToolbarSeparatorProps
>(function ToolbarSeparator(props, ref) {
  return (
    <Ariakit.ToolbarSeparator ref={ref} className="separator" {...props} />
  );
});

/* ToolbarSelect */

export interface ToolbarSelectProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> {
  options: Array<{
    value: string;
    icon?: React.ReactNode;
    label?: React.ReactNode;
  }>;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

export const ToolbarSelect = React.forwardRef<
  HTMLButtonElement,
  ToolbarSelectProps
>(function ToolbarSelect(props, ref) {
  const {
    options,
    // Accept controlled props.
    value,
    onChange,
    // Automatically set the default value as the first option. This is
    // necessary for server side rendering.
    defaultValue = options[0]?.value,
    ...rest
  } = props;

  const select = Ariakit.useSelectStore({
    value,
    setValue: onChange,
    defaultValue,
  });

  const selectValue = select.useState("value");

  // The display value includes an icon if one is provided, so we have to
  // compose it based on the value and the passed options.
  const displayValue = React.useMemo(() => {
    const item = options.find((option) => option.value === selectValue);
    return (
      <>
        {item?.icon}
        {item?.label || selectValue}
      </>
    );
  }, [options, selectValue]);

  return (
    <>
      <Ariakit.Select
        ref={ref}
        store={select}
        className="button"
        {...rest}
        render={<Ariakit.ToolbarItem />}
      >
        {displayValue}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover store={select} gutter={4} className="popover">
        {options.map((option) => (
          <Ariakit.SelectItem
            key={option.value}
            value={option.value}
            className="select-item"
          >
            {option.icon}
            {option.label || option.value}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </>
  );
});
