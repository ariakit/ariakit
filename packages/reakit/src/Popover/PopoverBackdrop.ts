import { unstable_createComponent } from "../utils/createComponent";
import {
  DialogBackdropOptions,
  DialogBackdropHTMLProps,
  useDialogBackdrop
} from "../Dialog/DialogBackdrop";
import { unstable_createHook } from "../utils/createHook";
import { usePopoverState } from "./PopoverState";

export type PopoverBackdropOptions = DialogBackdropOptions;

export type PopoverBackdropHTMLProps = DialogBackdropHTMLProps;

export type PopoverBackdropProps = PopoverBackdropOptions &
  PopoverBackdropHTMLProps;

export const usePopoverBackdrop = unstable_createHook<
  PopoverBackdropOptions,
  PopoverBackdropHTMLProps
>({
  name: "PopoverBackdrop",
  compose: useDialogBackdrop,
  useState: usePopoverState
});

export const PopoverBackdrop = unstable_createComponent({
  as: "div",
  useHook: usePopoverBackdrop
});
