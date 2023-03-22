import {
  ButtonHTMLAttributes,
  ReactNode,
  forwardRef,
  useLayoutEffect,
} from "react";
import * as Ariakit from "@ariakit/react";

export type MenuProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: ReactNode;
  title?: string;
  animated?: boolean;
  values?: Ariakit.MenuStoreProps["values"];
  setValues?: (values: any) => void;
  open?: Ariakit.MenuStoreProps["open"];
  setOpen?: Ariakit.MenuStoreProps["setOpen"];
  onUnmount?: () => void;
  initialFocusRef?: Ariakit.MenuProps["initialFocusRef"];
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
    const menu = Ariakit.useMenuStore({
      animated,
      values,
      setValues,
      open,
      setOpen,
    });
    const mounted = menu.useState("mounted");

    useLayoutEffect(() => {
      if (!mounted) {
        onUnmount?.();
      }
    }, [mounted]);

    return (
      <>
        <Ariakit.MenuButton
          store={menu}
          ref={ref}
          className="button"
          {...props}
        >
          {label}
        </Ariakit.MenuButton>
        <Ariakit.Menu
          store={menu}
          initialFocusRef={initialFocusRef}
          data-animated={animated ? "" : undefined}
          className="menu"
        >
          <Ariakit.MenuArrow />
          {title && (
            <div role="presentation" className="header">
              <Ariakit.MenuHeading className="heading">
                {title}
              </Ariakit.MenuHeading>
              <Ariakit.MenuItem
                as={Ariakit.MenuDismiss}
                className="menu-item"
              />
            </div>
          )}
          {children}
        </Ariakit.Menu>
      </>
    );
  }
);
