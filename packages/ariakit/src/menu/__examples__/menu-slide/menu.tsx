import {
  HTMLAttributes,
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  Menu as BaseMenu,
  MenuGroup as BaseMenuGroup,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  MenuButton,
  MenuButtonArrow,
  MenuGroupLabel,
  MenuHeading,
  useMenuState,
} from "ariakit/menu";
import { flushSync } from "react-dom";
import useIsomorphicLayoutEffect from "use-isomorphic-layout-effect";

type MenuContextProps = {
  getWrapper: () => HTMLElement | null;
  getMenu: () => HTMLElement | null;
  getOffsetRight: () => number;
};

const MenuContext = createContext<MenuContextProps | null>(null);

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

type MenuButtonProps = HTMLAttributes<HTMLDivElement> &
  RefAttributes<HTMLDivElement>;

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const parent = useContext(MenuContext);
    const isSubmenu = !!parent;

    const menu = useMenuState({
      placement: isSubmenu ? "right-start" : "bottom-start",
      overflowPadding: isSubmenu ? 0 : 8,
      animated: isSubmenu ? 500 : false,
      gutter: isSubmenu ? 0 : 8,
      flip: !isSubmenu,
      getAnchorRect: (anchor) => {
        return (
          parent?.getMenu()?.getBoundingClientRect() ||
          anchor?.getBoundingClientRect() ||
          null
        );
      },
    });

    // By default, submenus don't automatically receive focus when they open.
    // But here we want them to always receive focus.
    if (!menu.autoFocusOnShow) {
      menu.setAutoFocusOnShow(true);
    }

    const contextValue = useMemo<MenuContextProps>(
      () => ({
        getWrapper: () => parent?.getWrapper() || menu.popoverRef.current,
        getMenu: () => menu.baseRef.current,
        getOffsetRight: () =>
          (parent?.getOffsetRight() ?? 0) +
          (menu.baseRef.current?.offsetWidth ?? 0),
      }),
      [menu.popoverRef, menu.baseRef, parent?.getOffsetRight]
    );

    // Hide the submenu when it's not visible on scroll.
    useEffect(() => {
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

    // We only want to delay hiding the menu, so we immediately stop the
    // animation when it's opening.
    useIsomorphicLayoutEffect(() => {
      if (!menu.open) return;
      menu.stopAnimation();
    }, [menu.open, menu.stopAnimation]);

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <MenuButton
        as="button"
        state={menu}
        showOnHover={false}
        className="button"
        {...menuButtonProps}
      >
        <span className="label">{label}</span>
        <MenuButtonArrow />
      </MenuButton>
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
          <BaseMenuItem
            ref={ref}
            focusOnHover={false}
            className="menu-item"
            {...props}
          >
            {renderMenuButton}
          </BaseMenuItem>
        ) : (
          // Otherwise, we just render the menu button.
          renderMenuButton({ ref, ...props })
        )}
        {menu.mounted && (
          <BaseMenu
            state={menu}
            className="menu"
            portal={isSubmenu}
            portalElement={parent?.getWrapper}
            wrapperProps={wrapperProps}
            autoFocusOnShow={autoFocus}
            autoFocusOnHide={autoFocus}
          >
            <MenuContext.Provider value={contextValue}>
              {isSubmenu && (
                <>
                  <div className="header">
                    <BaseMenuItem
                      as="button"
                      hideOnClick={false}
                      focusOnHover={false}
                      onClick={menu.hide}
                      className="menu-item"
                      aria-label="Back to parent menu"
                    >
                      <MenuButtonArrow placement="left" />
                    </BaseMenuItem>
                    <MenuHeading className="heading">{label}</MenuHeading>
                  </div>
                  <MenuSeparator />
                </>
              )}
              {children}
            </MenuContext.Provider>
          </BaseMenu>
        )}
      </>
    );
  }
);

export type MenuItemProps = HTMLAttributes<HTMLButtonElement> & {
  label: ReactNode;
  disabled?: boolean;
};

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <BaseMenuItem
        as="button"
        className="menu-item"
        focusOnHover={false}
        ref={ref}
        {...props}
      >
        {label}
      </BaseMenuItem>
    );
  }
);

export type MenuSeparatorProps = HTMLAttributes<HTMLHRElement>;

export const MenuSeparator = forwardRef<HTMLHRElement, MenuSeparatorProps>(
  (props, ref) => {
    return <BaseMenuSeparator ref={ref} className="separator" {...props} />;
  }
);

export type MenuGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(
  ({ label, ...props }, ref) => {
    return (
      <BaseMenuGroup ref={ref} className="group" {...props}>
        {label && (
          <MenuGroupLabel className="group-label">{label}</MenuGroupLabel>
        )}
        {props.children}
      </BaseMenuGroup>
    );
  }
);
