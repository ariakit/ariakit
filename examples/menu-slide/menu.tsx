import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { flushSync } from "react-dom";

type MenuContextProps = {
  getWrapper: () => HTMLElement | null;
  getMenu: () => HTMLElement | null;
  getOffsetRight: () => number;
};

const MenuContext = React.createContext<MenuContextProps | null>(null);

export type MenuProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  disabled?: boolean;
};

type MenuButtonProps = React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>;

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const parent = React.useContext(MenuContext);
    const isSubmenu = !!parent;

    const menu = Ariakit.useMenuStore({
      placement: isSubmenu ? "right-start" : "bottom-start",
      animated: isSubmenu ? 500 : false,
    });

    const open = menu.useState("open");
    const mounted = menu.useState("mounted");
    const autoFocusOnShow = menu.useState("autoFocusOnShow");

    // By default, submenus don't automatically receive focus when they open.
    // But here we want them to always receive focus.
    React.useLayoutEffect(() => {
      if (!autoFocusOnShow) {
        menu.setAutoFocusOnShow(true);
      }
    }, [autoFocusOnShow, menu]);

    // We only want to delay hiding the menu, so we immediately stop the
    // animation when it's opening.
    React.useLayoutEffect(() => {
      if (open) {
        menu.stopAnimation();
      }
    }, [open, menu]);

    const contextValue = React.useMemo<MenuContextProps>(
      () => ({
        getWrapper: () =>
          parent?.getWrapper() || menu.getState().popoverElement,
        getMenu: () => menu.getState().baseElement,
        getOffsetRight: () =>
          (parent?.getOffsetRight() ?? 0) +
          (menu.getState().baseElement?.offsetWidth ?? 0),
      }),
      [menu, parent],
    );

    // Hide the submenu when it's not visible on scroll.
    React.useEffect(() => {
      if (!parent) return;
      const parentWrapper = parent.getWrapper();
      if (!parentWrapper) return;
      let timeout = 0;
      const onScroll = () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          // In right-to-left layouts, scrollLeft is negative.
          const scrollLeft = Math.abs(parentWrapper.scrollLeft);
          const wrapperOffset = scrollLeft + parentWrapper.clientWidth;
          if (wrapperOffset <= parent.getOffsetRight()) {
            // Since the submenu is not visible anymore at this point, we want
            // to hide it completely right away. That's why we syncrhonously
            // hide it and immediately stops the animation so it's completely
            // unmounted.
            flushSync(menu.hide);
            menu.stopAnimation();
          }
        }, 100);
      };
      parentWrapper.addEventListener("scroll", onScroll);
      return () => parentWrapper.removeEventListener("scroll", onScroll);
    }, [parent, menu.hide, menu.stopAnimation]);

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <Ariakit.MenuButton
        store={menu}
        showOnHover={false}
        className="button"
        render={<button />}
        {...menuButtonProps}
      >
        <span className="label">{label}</span>
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
    );

    const wrapperProps = {
      // This is necessary so Chrome scrolls the submenu into view.
      style: { left: "auto" },
      className: !isSubmenu ? "menu-wrapper" : "",
    };

    const autoFocus = (element: HTMLElement) => {
      if (!isSubmenu) return true;
      element.focus({ preventScroll: true });
      element.scrollIntoView({ block: "nearest", inline: "start" });
      return false;
    };

    return (
      <>
        {isSubmenu ? (
          // If it's a submenu, we have to combine the MenuButton and the
          // MenuItem components into a single component, so it works as a
          // submenu button.
          <Ariakit.MenuItem
            ref={ref}
            focusOnHover={false}
            className="menu-item"
            {...props}
          >
            {renderMenuButton}
          </Ariakit.MenuItem>
        ) : (
          // Otherwise, we just render the menu button.
          renderMenuButton({ ref, ...props })
        )}
        {mounted && (
          <Ariakit.Menu
            store={menu}
            className="menu"
            portal={isSubmenu}
            portalElement={parent?.getWrapper}
            wrapperProps={wrapperProps}
            autoFocusOnShow={autoFocus}
            autoFocusOnHide={autoFocus}
            overflowPadding={isSubmenu ? 0 : 8}
            gutter={isSubmenu ? 0 : 8}
            flip={!isSubmenu}
            getAnchorRect={(anchor) => {
              return (
                parent?.getMenu()?.getBoundingClientRect() ||
                anchor?.getBoundingClientRect() ||
                null
              );
            }}
          >
            <MenuContext.Provider value={contextValue}>
              {isSubmenu && (
                <>
                  <div className="header">
                    <Ariakit.MenuItem
                      hideOnClick={false}
                      focusOnHover={false}
                      onClick={menu.hide}
                      className="menu-item"
                      aria-label="Back to parent menu"
                      render={<button />}
                    >
                      <Ariakit.MenuButtonArrow placement="left" />
                    </Ariakit.MenuItem>
                    <Ariakit.MenuHeading className="heading">
                      {label}
                    </Ariakit.MenuHeading>
                  </div>
                  <MenuSeparator />
                </>
              )}
              {children}
            </MenuContext.Provider>
          </Ariakit.Menu>
        )}
      </>
    );
  },
);

export type MenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: React.ReactNode;
  disabled?: boolean;
};

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuItem
        className="menu-item"
        focusOnHover={false}
        render={<button ref={ref} {...props} />}
      >
        {label}
      </Ariakit.MenuItem>
    );
  },
);

export type MenuSeparatorProps = React.HTMLAttributes<HTMLHRElement>;

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  MenuSeparatorProps
>((props, ref) => {
  return <Ariakit.MenuSeparator ref={ref} className="separator" {...props} />;
});

export type MenuGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuGroup ref={ref} className="group" {...props}>
        {label && (
          <Ariakit.MenuGroupLabel className="group-label">
            {label}
          </Ariakit.MenuGroupLabel>
        )}
        {props.children}
      </Ariakit.MenuGroup>
    );
  },
);
