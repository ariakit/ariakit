import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { HTMLMotionProps, motion } from "framer-motion";

export type MenuProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  label: React.ReactNode;
  disabled?: boolean;
  animate?: HTMLMotionProps<"div">["animate"];
  transition?: HTMLMotionProps<"div">["transition"];
  variants?: HTMLMotionProps<"div">["variants"];
};

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  (
    { open, setOpen, label, children, animate, transition, variants, ...props },
    ref
  ) => {
    const menu = Ariakit.useMenuStore({ animated: !!animate, open, setOpen });
    const currentPlacement = menu.useState("currentPlacement");
    const [currentAnimation, setCurrentAnimation] = React.useState<unknown>();
    return (
      <>
        <Ariakit.MenuButton
          store={menu}
          className="button"
          {...props}
          ref={ref}
        >
          {label}
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        <Ariakit.Menu
          store={menu}
          className="menu"
          data-placement={currentPlacement}
          as={motion.div}
          animate={animate}
          transition={transition}
          variants={variants}
          // Framer starts and completes animations asynchronously. That is, a
          // leave animation may complete right after the enter animation starts
          // when the menu is closed and open fast enough. That's why we need to
          // keep track of the current animation so we can stop it correctly.
          onAnimationStart={setCurrentAnimation}
          onAnimationComplete={(animation: string) => {
            console.log(animation, currentAnimation);
            if (currentAnimation !== animation) return;
            if (!menu.getState().animating) return;
            menu.stopAnimation();
          }}
        >
          <Ariakit.MenuArrow className="menu-arrow" />
          {children}
        </Ariakit.Menu>
      </>
    );
  }
);

export type MenuItemProps = Omit<HTMLMotionProps<"div">, "children"> & {
  label?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
};

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuItem
        as={motion.div}
        ref={ref}
        className="menu-item"
        children={label}
        {...props}
      />
    );
  }
);

export type MenuSeparatorProps = React.HTMLAttributes<HTMLHRElement>;

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  MenuSeparatorProps
>((props, ref) => {
  return <Ariakit.MenuSeparator ref={ref} className="separator" {...props} />;
});
