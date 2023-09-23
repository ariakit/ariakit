import { createContext, forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Modal as WPModal } from "@wordpress/components";
import clsx from "clsx";
import { MenuSlotContext } from "./menu.jsx";

export const ModalContext = createContext(false);

export interface ModalProps extends ComponentPropsWithoutRef<typeof WPModal> {}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  function Modal(props, ref) {
    return (
      <WPModal
        ref={ref}
        {...props}
        className={clsx("dialog", props.className)}
        overlayClassName={clsx("backdrop", props.overlayClassName)}
        bodyOpenClassName={clsx(
          "examples-menu-wordpress-modal",
          props.bodyOpenClassName,
        )}
      >
        <ModalContext.Provider value={true}>
          <MenuSlotContext.Provider
            // Disable the menu context so menus outside the modal won't be
            //considered parent menus.
            value={null}
          >
            {props.children}
          </MenuSlotContext.Provider>
        </ModalContext.Provider>
      </WPModal>
    );
  },
);
