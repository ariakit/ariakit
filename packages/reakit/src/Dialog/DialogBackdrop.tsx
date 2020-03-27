import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { usePipe } from "reakit-utils/usePipe";
import {
  DisclosureRegionOptions,
  DisclosureRegionHTMLProps,
  useDisclosureRegion
} from "../Disclosure/DisclosureRegion";
import { Portal } from "../Portal/Portal";
import { useDialogState, DialogStateReturn } from "./DialogState";
import { DialogBackdropContext } from "./__utils/DialogBackdropContext";

export type DialogBackdropOptions = DisclosureRegionOptions &
  Pick<Partial<DialogStateReturn>, "modal">;

export type DialogBackdropHTMLProps = DisclosureRegionHTMLProps;

export type DialogBackdropProps = DialogBackdropOptions &
  DialogBackdropHTMLProps;

export const useDialogBackdrop = createHook<
  DialogBackdropOptions,
  DialogBackdropHTMLProps
>({
  name: "DialogBackdrop",
  compose: useDisclosureRegion,
  useState: useDialogState,

  useOptions({ modal = true, ...options }) {
    return { modal, ...options };
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
