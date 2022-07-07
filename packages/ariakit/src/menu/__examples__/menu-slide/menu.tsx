import {
  FocusEvent,
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
const NestedContext = createContext<() => number>(() => 0);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

// function isInViewport(element: Element, viewport: Element) {
//   const rect = element.getBoundingClientRect();
//   return (
//     rect.top >= 0 &&
//     rect.left >= 0 &&
//     rect.bottom <= viewport.clientHeight &&
//     rect.right <= viewport.clientWidth
//   );
// }

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

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

type MenuButtonProps = HTMLAttributes<HTMLDivElement> &
  RefAttributes<HTMLDivElement>;

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const getParentMenuPopover = useContext(MenuContext);
    const getParentWidth = useContext(NestedContext);
    const nested = !!getParentMenuPopover;
    const lastScrollRef = useRef(-1);

    const menu = useMenuState({
      gutter: 8,
      animated: nested ? 500 : false,
      renderCallback: useCallback(
        ({
          popover,
          defaultRenderCallback,
        }: PopoverStateRenderCallbackProps) => {
          if (nested) {
            console.log(getParentWidth());
            popover.style.position = "absolute";
            popover.style.top = "0";
            popover.style.left = getParentWidth() + "px";
            popover.style.scrollSnapAlign = "start";
            popover.style.scrollSnapStop = "always";

            let id = 0;

            const onScroll = (event: Event) => {
              clearTimeout(id);
              const el = event.currentTarget as HTMLElement;
              id = window.setTimeout(() => {
                const scrollPosition = el.scrollLeft;
                const forward = scrollPosition >= lastScrollRef.current;
                lastScrollRef.current = scrollPosition;
                if (forward) return;
                if (el.scrollLeft + el.clientWidth <= popover.offsetLeft) {
                  lastScrollRef.current = -1;
                  menu.hide();
                }
              }, 50);
            };
            const parentMenuPopover = getParentMenuPopover?.();
            parentMenuPopover?.addEventListener("scroll", onScroll);
            return () => {
              parentMenuPopover?.removeEventListener("scroll", onScroll);
            };
          }
          popover.className = "menu";
          popover.style.overflowY = "hidden";
          popover.style.overflowX = "scroll";
          popover.style.scrollSnapType = "x mandatory";
          popover.style.scrollBehavior = "smooth";
          popover.style.overscrollBehaviorY = "contain";
          popover.style.height = "150px";

          return defaultRenderCallback();
        },
        [getParentMenuPopover, nested]
      ),
    });

    useEffect(() => {
      if (menu.open) {
        requestAnimationFrame(() => {
          menu.stopAnimation();
        });
      }
    }, [menu.open, menu.stopAnimation]);

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <MenuButton
        state={menu}
        className="button"
        showOnHover={false}
        {...menuButtonProps}
        onFocus={(event: FocusEvent<HTMLDivElement>) => {
          // if (nested) {
          //   menu.hide();
          // }
          menuButtonProps.onFocus?.(event);
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

    const initialFocusRef = useRef<HTMLDivElement>(null);

    const getWidth = useCallback(() => {
      return getParentWidth() + (menu.popoverRef.current?.clientWidth || 0);
    }, [getParentWidth, menu.popoverRef]);

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
            onFocus={(event) => {
              if (nested) {
                event.currentTarget.scrollIntoView({
                  block: "nearest",
                  inline: "nearest",
                });
              }
              props.onFocus?.(event);
            }}
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
            initialFocusRef={initialFocusRef}
            className="menu-wrapper"
            style={{
              scrollSnapAlign: "start",
              height: "150px",
              overflowY: "auto",
            }}
          >
            <MenuContext.Provider value={getParentMenuPopover || portalElement}>
              <NestedContext.Provider value={getWidth}>
                {nested && (
                  <div>
                    <BaseMenuItem
                      className="menu-item"
                      hideOnClick={false}
                      focusOnHover={false}
                      ref={initialFocusRef}
                      onClick={menu.hide}
                      onFocus={(event) => {
                        // TODO: Add autoFocusOnShow/autoFocusOnHide functions
                        // to dialog. Firefox:
                        // getParentMenuPopover?.()?.scrollTo({ left: 1000 });
                        event.currentTarget.scrollIntoView({
                          block: "nearest",
                          inline: "nearest",
                        });
                      }}
                    >
                      &lt;
                    </BaseMenuItem>
                    <MenuHeading>Heading</MenuHeading>
                  </div>
                )}
                {children}
              </NestedContext.Provider>
            </MenuContext.Provider>
          </BaseMenu>
        )}
      </>
    );
  }
);
