import { HTMLAttributes, ReactNode, forwardRef, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { HTMLMotionProps, motion } from "framer-motion";

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
  animate?: HTMLMotionProps<"div">["animate"];
  transition?: HTMLMotionProps<"div">["transition"];
  variants?: HTMLMotionProps<"div">["variants"];
};

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  (
    { open, setOpen, label, children, animate, transition, variants, ...props },
    ref
  ) => {
    const menu = Ariakit.useMenuStore({ animated: !!animate, open, setOpen });
    const currentPlacement = menu.useState("currentPlacement");
    const [currentAnimation, setCurrentAnimation] = useState<unknown>();
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

export type MenuItemProps = HTMLMotionProps<"div"> & {
  label?: ReactNode;
  disabled?: boolean;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuItem
        as={motion.div}
        ref={ref}
        children={label}
        className="menu-item"
        {...props}
      />
    );
  }
);

export type MenuSeparatorProps = HTMLAttributes<HTMLHRElement>;

export const MenuSeparator = forwardRef<HTMLHRElement, MenuSeparatorProps>(
  (props, ref) => {
    return <Ariakit.MenuSeparator ref={ref} className="separator" {...props} />;
  }
);
