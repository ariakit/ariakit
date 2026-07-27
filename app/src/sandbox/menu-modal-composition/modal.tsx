import { Modal as WPModal } from "@wordpress/components";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { createContext, forwardRef } from "react";
import { MenuContext } from "./menu.tsx";

export const ModalContext = createContext(false);

export interface ModalProps extends ComponentPropsWithoutRef<typeof WPModal> {}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  function Modal(props, ref) {
    return (
      <WPModal
        {...props}
        ref={ref}
        className={clsx(
          "fixed inset-8 z-50 m-auto flex h-fit max-h-[calc(100vh-4rem)] max-w-xl flex-col overflow-auto rounded-xl bg-white p-4 text-black shadow-2xl outline-none [&_.components-button]:inline-flex [&_.components-button]:size-10 [&_.components-button]:items-center [&_.components-button]:justify-center [&_.components-modal__header]:flex [&_.components-modal__header]:items-center [&_.components-modal__header]:justify-between [&_.components-modal__header]:gap-4",
          props.className,
        )}
        overlayClassName={clsx(
          "fixed inset-0 z-50 bg-black/20",
          props.overlayClassName,
        )}
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
