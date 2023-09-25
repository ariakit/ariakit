import { createContext, forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Modal as WPModal } from "@wordpress/components";
import clsx from "clsx";
import { MenuContext } from "./menu.jsx";

export const ModalContext = createContext(false);

export interface ModalProps extends ComponentPropsWithoutRef<typeof WPModal> {}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  function Modal(props, ref) {
    return (
      <WPModal
        {...props}
        ref={ref}
        className={clsx("dialog", props.className)}
        overlayClassName={clsx("backdrop", props.overlayClassName)}
      >
        <ModalContext.Provider value={true}>
          <MenuContext.Provider
            // By default, Ariakit treats menus nested within the React trees as
            // submenus. This applies even when we nest Menu/Modal/Menu in that
            // sequence. To prevent the nested menu from being recognized as a
            // submenu, we can assign null to the `parent` prop of the menu
            // store. Since this MenuContext value will be passed to the
            // `parent` prop, we can assign null here.
            value={null}
          >
            {props.children}
          </MenuContext.Provider>
        </ModalContext.Provider>
      </WPModal>
    );
  },
);
