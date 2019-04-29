import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { HiddenOptions, HiddenProps, useHidden } from "../Hidden/Hidden";
import { unstable_createHook } from "../utils/createHook";
import { useDialogState } from "./DialogState";

export type DialogBackdropOptions = HiddenOptions;

export type DialogBackdropProps = HiddenProps;

export const useDialogBackdrop = unstable_createHook<
  DialogBackdropOptions,
  DialogBackdropProps
>({
  name: "DialogBackdrop",
  compose: useHidden,
  useState: useDialogState,

  useProps(_, htmlProps) {
    return mergeProps(
      {
        id: undefined,
        role: "presentation",
        style: {
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 998
        }
      } as DialogBackdropProps,
      htmlProps
    );
  }
});

export const DialogBackdrop = unstable_createComponent({
  as: "div",
  useHook: useDialogBackdrop
});
