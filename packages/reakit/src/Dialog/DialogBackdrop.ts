import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { HiddenOptions, HiddenHTMLProps, useHidden } from "../Hidden/Hidden";
import { useDialogState } from "./DialogState";

export type DialogBackdropOptions = HiddenOptions;

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

  useProps(_, htmlProps) {
    return {
      id: undefined,
      role: "presentation",
      ...htmlProps
    };
  }
});

export const DialogBackdrop = createComponent({
  as: "div",
  useHook: useDialogBackdrop
});
