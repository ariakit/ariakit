import { HTMLAttributes, ReactNode, forwardRef, useState } from "react";
import {
  Menu as BaseMenu,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  MenuArrow,
  MenuButton,
  MenuButtonArrow,
  useMenuStore,
} from "ariakit/menu/store";
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
    const menu = useMenuStore({ animated: !!animate, open, setOpen });
    const currentPlacement = menu.useState("currentPlacement");
    const [currentAnimation, setCurrentAnimation] = useState<unknown>();
    return (
      <>
        <MenuButton store={menu} className="button" {...props} ref={ref}>
          {label}
          <MenuButtonArrow />
        </MenuButton>
        <BaseMenu
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
          <MenuArrow className="menu-arrow" />
          {children}
        </BaseMenu>
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
      <BaseMenuItem
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
    return <BaseMenuSeparator ref={ref} className="separator" {...props} />;
  }
);
