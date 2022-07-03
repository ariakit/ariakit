import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import {
  Menu as BaseMenu,
  MenuProps as BaseMenuProps,
  MenuArrow,
  MenuButton,
  MenuDismiss,
  MenuHeading,
  MenuItem,
  MenuStateProps,
  useMenuState,
} from "ariakit/menu";
import useIsomorphicLayoutEffect from "use-isomorphic-layout-effect";

export type MenuProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: ReactNode;
  title?: string;
  animated?: boolean;
  values?: MenuStateProps["values"];
  onValuesChange?: (values: any) => void;
  items?: MenuStateProps["items"];
  onItemsChange?: MenuStateProps["setItems"];
  open?: MenuStateProps["open"];
  onOpenChange?: MenuStateProps["setOpen"];
  onUnmount?: () => void;
  initialFocusRef?: BaseMenuProps["initialFocusRef"];
};

export const Menu = forwardRef<HTMLButtonElement, MenuProps>(
  (
    {
      label,
      title,
      animated,
      values,
      onValuesChange,
      items,
      onItemsChange,
      open,
      onOpenChange,
      onUnmount,
      initialFocusRef,
      children,
      ...props
    },
    ref
  ) => {
    const menu = useMenuState({
      animated,
      values,
      setValues: onValuesChange,
      items,
      setItems: onItemsChange,
      open,
      setOpen: onOpenChange,
    });

    useIsomorphicLayoutEffect(() => {
      if (!menu.mounted) {
        onUnmount?.();
      }
    }, [menu.mounted]);

    return (
      <>
        <MenuButton state={menu} className="button" ref={ref} {...props}>
          {label}
        </MenuButton>
        <BaseMenu
          state={menu}
          initialFocusRef={initialFocusRef}
          data-animated={animated ? "" : undefined}
          className="menu"
        >
          <MenuArrow />
          {title && (
            <div role="presentation" className="header">
              <MenuHeading className="heading">{title}</MenuHeading>
              <MenuItem as={MenuDismiss} className="menu-item" />
            </div>
          )}
          {children}
        </BaseMenu>
      </>
    );
  }
);
