import type { ReactNode } from "react";
import { forwardRef, startTransition } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface CommandMenuProps extends Ariakit.DialogProps {
  open?: Ariakit.DialogStoreProps["open"];
  onOpenChange?: Ariakit.DialogStoreProps["setOpen"];
  onSearch?: Ariakit.ComboboxProviderProps["setValue"];
}

export const CommandMenu = forwardRef<HTMLDivElement, CommandMenuProps>(
  function CommandMenu({ open, onOpenChange, onSearch, ...props }, ref) {
    const dialog = Ariakit.useDialogStore({ open, setOpen: onOpenChange });
    return (
      <Ariakit.Dialog
        ref={ref}
        unmountOnHide
        backdrop={<div className="backdrop" />}
        {...props}
        store={dialog}
        className={clsx("dialog", props.className)}
      >
        <Ariakit.ComboboxProvider
          disclosure={dialog}
          focusLoop={false}
          includesBaseElement={false}
          resetValueOnHide
          setValue={(value) => {
            startTransition(() => {
              onSearch?.(value);
            });
          }}
        >
          {props.children}
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
  return (
    <div className="combobox-wrapper">
      <Ariakit.Combobox
        ref={ref}
        autoSelect="always"
        {...props}
        className={clsx("combobox", props.className)}
      />
      <Ariakit.DialogDismiss className="button secondary escape">
        Esc
      </Ariakit.DialogDismiss>
    </div>
  );
});

export interface CommandMenuListProps extends Ariakit.ComboboxListProps {}

export const CommandMenuList = forwardRef<HTMLDivElement, CommandMenuListProps>(
  function CommandMenuList(props, ref) {
    return (
      <Ariakit.ComboboxList
        ref={ref}
        {...props}
        className={clsx("list", props.className)}
      />
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
  return (
    <Ariakit.ComboboxGroup
      ref={ref}
      {...props}
      className={clsx("group", props.className)}
    >
      {label && (
        <Ariakit.ComboboxGroupLabel className="group-label">
          {label}
        </Ariakit.ComboboxGroupLabel>
      )}
      {props.children}
    </Ariakit.ComboboxGroup>
  );
});

export interface CommandMenuItemProps extends Ariakit.ComboboxItemProps {}

export const CommandMenuItem = forwardRef<HTMLDivElement, CommandMenuItemProps>(
  function CommandMenuItem(props, ref) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        hideOnClick
        focusOnHover
        blurOnHoverEnd={false}
        {...props}
        className={clsx("list-item", props.className)}
      />
    );
  },
);
