import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import {
  Menu as BaseMenu,
  MenuProps as BaseMenuProps,
  MenuArrow,
  MenuButton,
  MenuDismiss,
  MenuHeading,
  MenuItem,
  MenuStoreProps,
  useMenuStore,
} from "ariakit/menu/store";
import useIsomorphicLayoutEffect from "use-isomorphic-layout-effect";

export type MenuProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: ReactNode;
  title?: string;
  animated?: boolean;
  values?: MenuStoreProps["values"];
  setValues?: (values: any) => void;
  open?: MenuStoreProps["open"];
  setOpen?: MenuStoreProps["setOpen"];
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
    const menu = useMenuStore({ animated, values, setValues, open, setOpen });
    const mounted = menu.useState("mounted");

    useIsomorphicLayoutEffect(() => {
      if (!mounted) {
        onUnmount?.();
      }
    }, [mounted]);

    return (
      <>
        <MenuButton store={menu} ref={ref} className="button" {...props}>
          {label}
        </MenuButton>
        <BaseMenu
          store={menu}
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
