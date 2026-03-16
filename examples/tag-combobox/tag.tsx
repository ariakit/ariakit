import clsx from "clsx";
import * as React from "react";
import * as Ariakit from "./ariakit-experimental.ts";

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
          <Ariakit.TagListLabel className="ak-tag-list-label">
            {label}
          </Ariakit.TagListLabel>
        )}
        <Ariakit.TagList
          ref={ref}
          {...props}
          className={clsx("ak-tag-list ak-input ak-focusable", props.className)}
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
        className={clsx("ak-tag", props.className)}
      >
        {props.children}
        <Ariakit.TagRemove className="ak-tag-remove" />
      </Ariakit.Tag>
    );
  },
);

export interface TagInputProps extends Ariakit.TagInputProps {
  children?: React.ReactNode;
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput({ children, ...props }, ref) {
    const tagInput = (
      <Ariakit.TagInput
        ref={ref}
        {...props}
        className={clsx("ak-tag-input", props.className)}
      />
    );

    if (!children) return tagInput;

    return (
      <Ariakit.ComboboxProvider>
        <Ariakit.Combobox
          ref={ref}
          autoSelect
          showMinLength={1}
          showOnKeyPress
          autoComplete="both"
          render={tagInput}
        />
        <Ariakit.ComboboxPopover
          className="ak-popover ak-popup ak-elevation-1"
          flip={false}
          gutter={12}
          shift={-4}
          unmountOnHide
        >
          {children}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    );
  },
);

export interface TagOptionProps extends Ariakit.ComboboxItemProps {
  value: string;
}

export const TagOption = React.forwardRef<HTMLDivElement, TagOptionProps>(
  function TagOption(props, ref) {
    const combobox = Ariakit.useComboboxContext()!;
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        focusOnHover
        blurOnHoverEnd={false}
        // Hides the combobox popover only upon selecting a value, so the user
        // can continue to deselect values by clicking on them without the
        // popover closing.
        selectValueOnClick={() => {
          const { selectedValue } = combobox.getState();
          if (!selectedValue.includes(props.value)) {
            combobox.hide();
          }
          return true;
        }}
        {...props}
        className={clsx("ak-combobox-item", props.className)}
      >
        {props.children}
        <Ariakit.ComboboxItemCheck />
      </Ariakit.ComboboxItem>
    );
  },
);
