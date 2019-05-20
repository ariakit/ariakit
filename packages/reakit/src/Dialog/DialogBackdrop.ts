import { unstable_createComponent } from "../utils/createComponent";
import { HiddenOptions, HiddenHTMLProps, useHidden } from "../Hidden/Hidden";
import { unstable_createHook } from "../utils/createHook";
import { useDialogState } from "./DialogState";

export type DialogBackdropOptions = HiddenOptions;

export type DialogBackdropHTMLProps = HiddenHTMLProps;

export type DialogBackdropProps = DialogBackdropOptions &
  DialogBackdropHTMLProps;

export const useDialogBackdrop = unstable_createHook<
  DialogBackdropOptions,
  DialogBackdropHTMLProps
>({
  name: "DialogBackdrop",
  compose: useHidden,
  useState: useDialogState,

  useProps(_, { style: htmlStyle, ...htmlProps }) {
    return {
      id: undefined,
      role: "presentation",
      style: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 998,
        ...htmlStyle
      },
      ...htmlProps
    };
  }
});

export const DialogBackdrop = unstable_createComponent({
  as: "div",
  useHook: useDialogBackdrop
});
