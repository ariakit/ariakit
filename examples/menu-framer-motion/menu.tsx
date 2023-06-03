import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as Ariakit from "@ariakit/react";
import type { HTMLMotionProps, MotionProps } from "framer-motion";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

export interface MenuProps extends ComponentPropsWithoutRef<"div"> {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
  animate?: MotionProps["animate"];
  transition?: MotionProps["transition"];
  variants?: MotionProps["variants"];
  initial?: MotionProps["initial"];
  exit?: MotionProps["exit"];
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    open,
    setOpen,
    label,
    children,
    animate,
    transition,
    variants,
    initial,
    exit,
    ...props
  },
  ref
) {
  const menu = Ariakit.useMenuStore({ open, setOpen });
  const currentPlacement = menu.useState("currentPlacement");
  const mounted = menu.useState("mounted");
  return (
    <MotionConfig reducedMotion="user">
      <Ariakit.MenuButton store={menu} ref={ref} className="button" {...props}>
        {label}
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <AnimatePresence>
        {mounted && (
          <Ariakit.Menu
            store={menu}
            alwaysVisible
            className="menu"
            // We'll use this data attribute to style the transform-origin
            // property based on the menu's placement. See style.css.
            data-placement={currentPlacement}
            render={
              <motion.div
                initial={initial}
                exit={exit}
                animate={animate}
                variants={variants}
                transition={transition}
              />
            }
          >
            <Ariakit.MenuArrow className="menu-arrow" />
            {children}
          </Ariakit.Menu>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
});

export const MenuItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function MenuItem(props, ref) {
    return (
      <Ariakit.MenuItem
        ref={ref}
        className="menu-item"
        render={<motion.div {...props} />}
      />
    );
  }
);
