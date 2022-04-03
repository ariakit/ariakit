import {
  HTMLAttributes,
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  Menu as BaseMenu,
  MenuItem as BaseMenuItem,
  MenuButton,
  MenuButtonArrow,
  MenuHeading,
  useMenuState,
} from "ariakit/menu";
import { PopoverStateRenderCallbackProps } from "ariakit/popover";

// Use React Context so we can determine if the menu is a submenu or not.
const MenuContext = createContext<(() => HTMLElement | null) | null>(null);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <BaseMenuItem className="menu-item" ref={ref} {...props}>
        {label}
      </BaseMenuItem>
    );
  }
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
    const nested = !!getParentMenuPopover;

    const menu = useMenuState({
      gutter: 8,
      animated: nested ? 500 : false,
      renderCallback: useCallback(
        ({
          popover,
          defaultRenderCallback,
        }: PopoverStateRenderCallbackProps) => {
          if (nested) {
            popover.style.position = "absolute";
            popover.style.top = "0";
            popover.style.left = "100%";
            popover.style.scrollSnapAlign = "start";
            popover.style.scrollSnapStop = "always";

            const onScroll = (event: Event) => {
              if (event.target.scrollLeft === 0) {
                // menu.hide();
              }
            };
            const parentMenuPopover = getParentMenuPopover?.();
            parentMenuPopover?.addEventListener("scroll", onScroll);
            return () => {
              parentMenuPopover?.removeEventListener("scroll", onScroll);
            };
          }
          popover.style.overflowY = "hidden";
          popover.style.overflowX = "scroll";
          popover.style.scrollSnapType = "x mandatory";
          popover.style.scrollBehavior = "smooth";
          popover.style.overscrollBehavior = "contain";

          popover.style.height = "150px";
          return defaultRenderCallback();
        },
        [getParentMenuPopover, nested]
      ),
    });

    useEffect(() => {
      if (menu.visible) {
        menu.stopAnimation();
      }
    }, [menu.visible, menu.stopAnimation]);

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <MenuButton
        state={menu}
        className="button"
        showOnHover={false}
        {...menuButtonProps}
        onClick={(event) => {
          if (nested) {
            menu.setAutoFocusOnShow(true);
            // menu.show();
            // event.preventDefault();
          }
          menuButtonProps.onClick?.(event);
        }}
      >
        <span className="label">{label}</span>
        <MenuButtonArrow />
      </MenuButton>
    );

    if (nested && !menu.autoFocusOnShow) {
      // menu.setAutoFocusOnShow(true);
    }

    // if (nested && menu.initialFocus !== "first") {
    //   menu.setInitialFocus("first");
    // }

    const portalElement = useCallback(
      () => menu.popoverRef.current,
      [menu.mounted, menu.popoverRef]
    );

    const initialFocusRef = useRef<HTMLDivElement>(null);

    return (
      <>
        {nested ? (
          // If it's a submenu, we have to combine the MenuButton and the
          // MenuItem components into a single component, so it works as a
          // submenu button.
          <BaseMenuItem className="menu-item" ref={ref} {...props}>
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
            initialFocusRef={initialFocusRef}
            className="menu"
            style={{
              scrollSnapAlign: "start",
              // scrollSnapStop: "always",
              height: "150px",
              overflowY: "auto",
            }}
          >
            <MenuContext.Provider value={portalElement}>
              {nested && (
                <div>
                  <BaseMenuItem
                    hideOnClick={false}
                    ref={initialFocusRef}
                    onClick={menu.hide}
                  >
                    &lt;
                  </BaseMenuItem>
                  <MenuHeading>Heading</MenuHeading>
                </div>
              )}
              {children}
            </MenuContext.Provider>
          </BaseMenu>
        )}
      </>
    );
  }
);
