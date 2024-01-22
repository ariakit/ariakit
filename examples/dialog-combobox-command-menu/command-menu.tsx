import type { ElementRef, ReactNode } from "react";
import { forwardRef, startTransition } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface CommandMenuProps extends Ariakit.DialogProps {
  open?: Ariakit.DialogStoreProps["open"];
  onOpenChange?: Ariakit.DialogStoreProps["setOpen"];
  onSearch?: Ariakit.ComboboxProviderProps["setValue"];
}

export const CommandMenu = forwardRef<
  ElementRef<typeof Ariakit.Dialog>,
  CommandMenuProps
>(function CommandMenu({ open, onOpenChange, onSearch, ...props }, ref) {
  const dialog = Ariakit.useDialogStore({ open, setOpen: onOpenChange });
  return (
    <Ariakit.Dialog
      ref={ref}
      unmountOnHide
      backdrop={<div className="backdrop" />}
      {...props}
      store={dialog}
      className={clsx("dialog", props.className)}
      autoFocusOnShow={() => {
        const selector = '[data-command-menu-item]:not([aria-disabled="true"])';
        const item = document.querySelector<HTMLElement>(selector);
        if (!item) return true;
        item.focus();
        return false;
      }}
    >
      <Ariakit.ComboboxProvider
        disclosure={dialog}
        includesBaseElement={false}
        focusLoop={false}
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
});

export interface CommandMenuInputProps extends Ariakit.ComboboxProps {}

export const CommandMenuInput = forwardRef<
  ElementRef<typeof Ariakit.Combobox>,
  CommandMenuInputProps
>(function CommandMenuInput(props, ref) {
  return (
    <div className="combobox-wrapper">
      <Ariakit.Combobox
        ref={ref}
        autoSelect
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

export const CommandMenuList = forwardRef<
  ElementRef<typeof Ariakit.ComboboxList>,
  CommandMenuListProps
>(function CommandMenuList(props, ref) {
  return (
    <Ariakit.ComboboxList
      ref={ref}
      alwaysVisible
      {...props}
      className={clsx("listbox", props.className)}
    />
  );
});

export interface CommandMenuGroupProps extends Ariakit.ComboboxGroupProps {
  label?: ReactNode;
}

export const CommandMenuGroup = forwardRef<
  ElementRef<typeof Ariakit.ComboboxGroup>,
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

export interface CommandMenuItemProps extends Ariakit.ComboboxItemProps {
  icon?: ReactNode;
  type?: ReactNode;
  group?: ReactNode;
}

export const CommandMenuItem = forwardRef<
  ElementRef<typeof Ariakit.ComboboxItem>,
  CommandMenuItemProps
>(function CommandMenuItem(props, ref) {
  return (
    <Ariakit.ComboboxItem
      ref={ref}
      focusOnHover
      blurOnHoverEnd={false}
      hideOnClick
      {...props}
      data-command-menu-item
      className={clsx("combobox-item", props.className)}
    >
      {props.icon && (
        <span className="item-icon" aria-hidden>
          {props.icon}
        </span>
      )}
      {props.children}
      {props.group && (
        <span className="item-group" aria-hidden>
          {props.group}
        </span>
      )}
      {props.type && (
        <span className="item-type" aria-hidden>
          {props.type}
        </span>
      )}
    </Ariakit.ComboboxItem>
  );
});
