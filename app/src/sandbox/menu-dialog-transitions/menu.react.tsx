import * as Ariakit from "@ariakit/react";
import * as React from "react";

export type MenuProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: React.ReactNode;
  title?: string;
  animated?: boolean;
  values?: Ariakit.MenuStoreProps["values"];
  setValues?: Ariakit.MenuStoreProps["setValues"];
  open?: Ariakit.MenuStoreProps["open"];
  setOpen?: Ariakit.MenuStoreProps["setOpen"];
  onUnmount?: () => void;
  initialFocus?: Ariakit.MenuProps["initialFocus"];
};

export const Menu = React.forwardRef<HTMLButtonElement, MenuProps>(
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
      initialFocus,
      children,
      ...props
    },
    ref,
  ) => {
    const menu = Ariakit.useMenuStore({
      animated,
      values,
      setValues,
      open,
      setOpen,
      setMounted(mounted) {
        if (!mounted) {
          onUnmount?.();
        }
      },
    });
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
          initialFocus={initialFocus}
          data-animated={animated ? "" : undefined}
          className="menu min-h-min overflow-visible opacity-0 [transform:translate3d(0,-16px,0)] transition-[opacity,transform] [&[data-enter]]:opacity-100 [&[data-enter]]:[transform:translate3d(0,0,0)]"
        >
          <Ariakit.MenuArrow />
          {title && (
            <div role="presentation" className="header">
              <Ariakit.MenuHeading className="heading">
                {title}
              </Ariakit.MenuHeading>
              <Ariakit.MenuItem
                className="menu-item"
                render={<Ariakit.MenuDismiss />}
              />
            </div>
          )}
          {children}
        </Ariakit.Menu>
      </>
    );
  },
);
