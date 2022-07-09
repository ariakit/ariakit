import {
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
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

// Use React Context so we can determine if the menu is a submenu or not.
const MenuContext = createContext<(() => HTMLElement | null) | null>(null);
const ParentMenuContext = createContext<(() => HTMLElement | null) | null>(
  null
);

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

type MenuButtonProps = HTMLAttributes<HTMLDivElement> &
  RefAttributes<HTMLDivElement>;

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const getParentMenuPopover = useContext(MenuContext);
    const getParentMenu = useContext(ParentMenuContext);
    const nested = !!getParentMenuPopover;

    const menu = useMenuState({
      gutter: 8,
      animated: nested ? 500 : false,
      flip: !nested,
      placement: nested ? "right-start" : "bottom-start",
      overflowPadding: 0,
      getAnchorRect: (anchor) => {
        if (getParentMenu) {
          return getParentMenu()?.getBoundingClientRect() || null;
        }
        return anchor?.getBoundingClientRect() || null;
      },
    });

    useEffect(() => {
      if (!getParentMenuPopover) return;
      const parentMenuPopover = getParentMenuPopover();
      if (!parentMenuPopover) return;
      let id = 0;

      const onScroll = (event: Event) => {
        clearTimeout(id);
        const el = event.currentTarget as HTMLElement;
        id = window.setTimeout(() => {
          const popover = menu.popoverRef.current;
          if (!popover) return;
          // TOOD: Can't do this. Implementation detail.
          const transform = getComputedStyle(popover).transform;
          const matrix = new DOMMatrixReadOnly(transform);
          if (el.scrollLeft + el.clientWidth <= matrix.m41) {
            flushSync(() => {
              menu.hide();
            });
            menu.stopAnimation();
          }
        }, 100);
      };
      parentMenuPopover.addEventListener("scroll", onScroll);
      return () => {
        parentMenuPopover.removeEventListener("scroll", onScroll);
      };
    }, [menu.popoverRef, getParentMenuPopover, menu.hide, menu.stopAnimation]);

    if (menu.open && menu.animating) {
      menu.stopAnimation();
    }

    // useEffect(() => {
    //   if (menu.open) {
    //     // menu.stopAnimation();
    //     requestAnimationFrame(() => {
    //       menu.stopAnimation();
    //     });
    //   }
    // }, [menu.open, menu.stopAnimation]);

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <MenuButton
        state={menu}
        className="button"
        showOnHover={false}
        {...menuButtonProps}
        onClick={(event: MouseEvent<HTMLDivElement>) => {
          menuButtonProps.onClick?.(event);
          menu.setAutoFocusOnShow(true);
        }}
      >
        <span className="label">{label}</span>
        <MenuButtonArrow />
      </MenuButton>
    );

    const portalElement = useCallback(
      () => menu.popoverRef.current,
      [menu.mounted, menu.popoverRef]
    );

    const baseElement = useCallback(
      () => menu.contentElement,
      [menu.contentElement]
    );

    return (
      <>
        {nested ? (
          // If it's a submenu, we have to combine the MenuButton and the
          // MenuItem components into a single component, so it works as a
          // submenu button.
          <BaseMenuItem
            className="menu-item"
            focusOnHover={false}
            ref={ref}
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
            portal={nested}
            portalElement={nested ? getParentMenuPopover : undefined}
            className={`menu${nested ? " nested" : ""}`}
            wrapperProps={{
              className: nested ? "menu-wrapper-nested" : "menu-wrapper",
            }}
            hideOnHoverOutside={false}
            autoFocusOnShow={(element) => {
              if (!nested) return true;
              element.focus({ preventScroll: true });
              element.scrollIntoView({ block: "nearest", inline: "start" });
              return false;
            }}
          >
            <MenuContext.Provider
              value={nested ? getParentMenuPopover : portalElement}
            >
              <ParentMenuContext.Provider value={baseElement}>
                {nested && (
                  <>
                    <div className="header">
                      <BaseMenuItem
                        className="menu-item back"
                        hideOnClick={false}
                        focusOnHover={false}
                        onClick={menu.hide}
                      >
                        <MenuButtonArrow placement="left" />
                      </BaseMenuItem>
                      <MenuHeading className="heading">{label}</MenuHeading>
                    </div>
                    <MenuSeparator />
                  </>
                )}
                {children}
              </ParentMenuContext.Provider>
            </MenuContext.Provider>
          </BaseMenu>
        )}
      </>
    );
  }
);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <BaseMenuItem
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
