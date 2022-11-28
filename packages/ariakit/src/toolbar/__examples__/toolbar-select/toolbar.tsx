import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useMemo,
} from "react";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import {
  Toolbar as BaseToolbar,
  ToolbarSeparator as BaseToolbarSeparator,
  ToolbarItem,
  useToolbarStore,
} from "ariakit/toolbar/store";

/* Toolbar */

export type ToolbarProps = HTMLAttributes<HTMLDivElement>;

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  (props, ref) => {
    const toolbar = useToolbarStore();
    return (
      <BaseToolbar ref={ref} store={toolbar} className="toolbar" {...props} />
    );
  }
);

/* ToolbarButton */

export type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (props, ref) => {
    return <ToolbarItem ref={ref} className="button" {...props} />;
  }
);

/* ToolbarSeparator */

export type ToolbarSeparatorProps = HTMLAttributes<HTMLHRElement>;

export const ToolbarSeparator = forwardRef<
  HTMLHRElement,
  ToolbarSeparatorProps
>((props, ref) => {
  return <BaseToolbarSeparator ref={ref} className="separator" {...props} />;
});

/* ToolbarSelect */

export type ToolbarSelectProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  options: Array<{ value: string; icon?: ReactNode; label?: ReactNode }>;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
};

export const ToolbarSelect = forwardRef<HTMLButtonElement, ToolbarSelectProps>(
  (props, ref) => {
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

    const select = useSelectState({
      value,
      setValue: onChange,
      defaultValue,
      gutter: 4,
    });

    // The display value includes an icon if one is provided, so we have to
    // compose it based on the value and the passed options.
    const displayValue = useMemo(() => {
      const item = options.find((option) => option.value === select.value);
      return (
        <>
          {item?.icon}
          {item?.label || select.value}
        </>
      );
    }, [options, select.value]);

    return (
      <>
        <Select
          as={ToolbarItem}
          ref={ref}
          state={select}
          className="button"
          {...rest}
        >
          {displayValue}
          <SelectArrow />
        </Select>
        <SelectPopover state={select} className="popover">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="select-item"
            >
              {option.icon}
              {option.label || option.value}
            </SelectItem>
          ))}
        </SelectPopover>
      </>
    );
  }
);
