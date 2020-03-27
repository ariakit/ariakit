import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  DialogBackdropOptions,
  DialogBackdropHTMLProps,
  useDialogBackdrop
} from "../Dialog/DialogBackdrop";
import { usePopoverState } from "./PopoverState";

export type PopoverBackdropOptions = DialogBackdropOptions;

export type PopoverBackdropHTMLProps = DialogBackdropHTMLProps;

export type PopoverBackdropProps = PopoverBackdropOptions &
  PopoverBackdropHTMLProps;

export const usePopoverBackdrop = createHook<
  PopoverBackdropOptions,
  PopoverBackdropHTMLProps
>({
  name: "PopoverBackdrop",
  compose: useDialogBackdrop,
  useState: usePopoverState,

  useOptions({ modal = false, ...options }) {
    return { modal, ...options };
  }
});

export const PopoverBackdrop = createComponent({
  as: "div",
  useHook: usePopoverBackdrop
});
