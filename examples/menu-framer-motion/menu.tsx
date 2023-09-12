import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import type { MotionProps } from "framer-motion";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

export interface MenuProps extends Ariakit.MenuButtonProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  label: React.ReactNode;
  children?: React.ReactNode;
  animate?: MotionProps["animate"];
  transition?: MotionProps["transition"];
  variants?: MotionProps["variants"];
  initial?: MotionProps["initial"];
  exit?: MotionProps["exit"];
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
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
  ref,
) {
  const menu = Ariakit.useMenuStore({ open, setOpen });
  const currentPlacement = menu.useState("currentPlacement");
  const mounted = menu.useState("mounted");
  return (
    <MotionConfig reducedMotion="user">
      <Ariakit.MenuButton
        store={menu}
        ref={ref}
        {...props}
        className={clsx("button", props.className)}
      >
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

export interface MenuItemProps
  extends React.ComponentPropsWithoutRef<typeof MotionMenuItem> {}

// Instead of using the Ariakit `render` prop, we give control to Framer Motion
// so it can process the props before we pass the remainder to
// `Ariakit.MenuItem`.
const MotionMenuItem = motion(Ariakit.MenuItem);

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    return (
      <MotionMenuItem
        ref={ref}
        {...props}
        className={clsx("menu-item", props.className)}
      />
    );
  },
);
