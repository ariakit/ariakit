import * as React from "react";
import clsx from "clsx";
import * as Ariakit from "./experimental-ariakit.js";

export interface TagListProps extends Ariakit.TagListProps {
  label?: React.ReactNode;
  value?: Ariakit.TagProviderProps["value"];
  setValue?: Ariakit.TagProviderProps["setValue"];
  values?: Ariakit.TagProviderProps["values"];
  setValues?: Ariakit.TagProviderProps["setValues"];
}

export const TagList = React.forwardRef<HTMLDivElement, TagListProps>(
  function TagList(
    { label, value, setValue, values, setValues, ...props },
    ref,
  ) {
    return (
      <Ariakit.TagProvider
        value={value}
        setValue={setValue}
        values={values}
        setValues={setValues}
      >
        {label && (
          <Ariakit.TagListLabel className="tag-list-label">
            {label}
          </Ariakit.TagListLabel>
        )}
        <Ariakit.TagList
          ref={ref}
          {...props}
          className={clsx("tag-list input", props.className)}
        />
      </Ariakit.TagProvider>
    );
  },
);

export interface TagProps extends Ariakit.TagProps {}

export const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  function Tag(props, ref) {
    return (
      <Ariakit.Tag
        ref={ref}
        {...props}
        className={clsx("tag", props.className)}
      >
        {props.children}
        <Ariakit.TagRemove className="tag-remove" />
      </Ariakit.Tag>
    );
  },
);

export interface TagInputProps extends Ariakit.TagInputProps {}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput(props, ref) {
    return (
      <Ariakit.TagInput
        ref={ref}
        {...props}
        className={clsx("tag-input", props.className)}
      />
    );
  },
);

export interface ComboboxProps extends Ariakit.ComboboxProps {
  popover?: Ariakit.ComboboxPopoverProps["render"];
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox({ children, popover, ...props }, ref) {
    return (
      <Ariakit.ComboboxProvider>
        <Ariakit.Combobox
          ref={ref}
          autoSelect
          showMinLength={1}
          showOnKeyPress
          {...props}
        />
        <Ariakit.ComboboxPopover
          className="popover popup elevation-1"
          flip={false}
          gutter={12}
          shift={-4}
          render={popover}
        >
          {children}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    );
  },
);

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {
  value: string;
}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    const combobox = Ariakit.useComboboxContext()!;
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        focusOnHover
        blurOnHoverEnd={false}
        // Hide only upon selecting a value, so the user can continue to
        // deselect values by clicking on them without the popover closing.
        selectValueOnClick={() => {
          const { selectedValue } = combobox.getState();
          if (!selectedValue.includes(props.value)) {
            combobox.hide();
          }
          return true;
        }}
        {...props}
        className={clsx("combobox-item", props.className)}
      >
        {props.children}
        <Ariakit.ComboboxItemCheck />
      </Ariakit.ComboboxItem>
    );
  },
);
