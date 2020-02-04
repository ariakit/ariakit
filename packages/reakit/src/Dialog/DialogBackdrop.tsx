import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { HiddenOptions, HiddenHTMLProps, useHidden } from "../Hidden/Hidden";
import { Portal } from "../Portal/Portal";
import { useDialogState, DialogStateReturn } from "./DialogState";
import { DialogBackdropContext } from "./__utils/DialogBackdropContext";

export type DialogBackdropOptions = HiddenOptions &
  Pick<Partial<DialogStateReturn>, "unstable_portal">;

export type DialogBackdropHTMLProps = HiddenHTMLProps;

export type DialogBackdropProps = DialogBackdropOptions &
  DialogBackdropHTMLProps;

export const useDialogBackdrop = createHook<
  DialogBackdropOptions,
  DialogBackdropHTMLProps
>({
  name: "DialogBackdrop",
  compose: useHidden,
  useState: useDialogState,

  useProps(options, htmlProps) {
    const wrapChildren = React.useCallback(
      (children: React.ReactNode) => {
        if (options.unstable_portal) {
          return (
            <Portal>
              <DialogBackdropContext.Provider value>
                {children}
              </DialogBackdropContext.Provider>
            </Portal>
          );
        }
        return children as JSX.Element;
      },
      [options.unstable_portal]
    );

    return {
      id: undefined,
      role: undefined,
      unstable_wrap: wrapChildren,
      ...htmlProps
    };
  }
});

export const DialogBackdrop = createComponent({
  as: "div",
  useHook: useDialogBackdrop
});
