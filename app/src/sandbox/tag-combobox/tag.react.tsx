import { clsx } from "clsx";
import * as React from "react";
import * as Ariakit from "./ariakit-experimental.react.ts";

export interface TagFieldProps extends Ariakit.TagControlProps {
  label?: React.ReactNode;
  value?: Ariakit.TagProviderProps["value"];
  setValue?: Ariakit.TagProviderProps["setValue"];
  values?: Ariakit.TagProviderProps["values"];
  setValues?: Ariakit.TagProviderProps["setValues"];
}

export const TagField = React.forwardRef<HTMLDivElement, TagFieldProps>(
  function TagField(
    { label, value, setValue, values, setValues, ...props },
    ref,
  ) {
    // Uses the store prop instead of TagProvider, so the tag list and the tag
    // input inherit the store from TagControl.
    const tag = Ariakit.useTagStore({ value, setValue, values, setValues });
    return (
      <>
        {label && (
          <Ariakit.TagListLabel store={tag} className="ak-tag-list-label">
            {label}
          </Ariakit.TagListLabel>
        )}
        <Ariakit.TagControl
          ref={ref}
          store={tag}
          {...props}
          className={clsx("ak-tag-list ak-input ak-focusable", props.className)}
        />
      </>
    );
  },
);

export interface TagListProps extends Ariakit.TagListProps {}

export const TagList = React.forwardRef<HTMLDivElement, TagListProps>(
  function TagList(props, ref) {
    return (
      <Ariakit.TagList
        ref={ref}
        {...props}
        // The listbox generates no box, so the tags share the field's layout
        // with the input, which is a sibling of this element.
        style={{ display: "contents", ...props.style }}
      />
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
