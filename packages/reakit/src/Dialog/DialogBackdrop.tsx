import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { usePipe } from "reakit-utils/usePipe";
import {
  DisclosureContentOptions,
  DisclosureContentHTMLProps,
  useDisclosureContent
} from "../Disclosure/DisclosureContent";
import { Portal } from "../Portal/Portal";
import { useDialogState, DialogStateReturn } from "./DialogState";
import { DialogBackdropContext } from "./__utils/DialogBackdropContext";

export type DialogBackdropOptions = DisclosureContentOptions &
  Pick<Partial<DialogStateReturn>, "modal">;

export type DialogBackdropHTMLProps = DisclosureContentHTMLProps;

export type DialogBackdropProps = DialogBackdropOptions &
  DialogBackdropHTMLProps;

export const useDialogBackdrop = createHook<
  DialogBackdropOptions,
  DialogBackdropHTMLProps
>({
  name: "DialogBackdrop",
  compose: useDisclosureContent,
  useState: useDialogState,

  useOptions({ modal = true, ...options }) {
    return { modal, ...options, unstable_setBaseId: undefined };
  },

  useProps(options, { wrapElement: htmlWrapElement, ...htmlProps }) {
    const wrapElement = React.useCallback(
      (element: React.ReactNode) => {
        if (options.modal) {
          return (
            <Portal>
              <DialogBackdropContext.Provider value>
                {element}
              </DialogBackdropContext.Provider>
            </Portal>
          );
        }
        return element;
      },
      [options.modal]
    );

    return {
      id: undefined,
      role: undefined,
      wrapElement: usePipe(wrapElement, htmlWrapElement),
      "data-dialog-ref": options.baseId,
      ...htmlProps
    };
  }
});

export const DialogBackdrop = createComponent({
  as: "div",
  useHook: useDialogBackdrop
});
