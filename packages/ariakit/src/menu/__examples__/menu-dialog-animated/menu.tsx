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
  setValues?: (values: any) => void;
  open?: MenuStateProps["open"];
  setOpen?: MenuStateProps["setOpen"];
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
      setValues,
      open,
      setOpen,
      onUnmount,
      initialFocusRef,
      children,
      ...props
    },
    ref
  ) => {
    const menu = useMenuState({ animated, values, setValues, open, setOpen });

    useIsomorphicLayoutEffect(() => {
      if (!menu.mounted) {
        onUnmount?.();
      }
    }, [menu.mounted]);

    return (
      <>
        <MenuButton state={menu} ref={ref} className="button" {...props}>
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
