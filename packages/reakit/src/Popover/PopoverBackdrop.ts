import { unstable_createComponent } from "../utils/createComponent";
import {
  DialogBackdropOptions,
  DialogBackdropProps,
  useDialogBackdrop
} from "../Dialog/DialogBackdrop";
import { unstable_createHook } from "../utils/createHook";
import { usePopoverState } from "./PopoverState";

export type PopoverBackdropOptions = DialogBackdropOptions;

export type PopoverBackdropProps = DialogBackdropProps;

export const usePopoverBackdrop = unstable_createHook<
  PopoverBackdropOptions,
  PopoverBackdropProps
>({
  name: "PopoverBackdrop",
  compose: useDialogBackdrop,
  useState: usePopoverState
});

export const PopoverBackdrop = unstable_createComponent({
  as: "div",
  useHook: usePopoverBackdrop
});
