import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import {
  dialog,
  dialogBackdrop,
  dialogDescription,
  dialogDisclosure,
  dialogDismiss,
  dialogHeading,
  dialogScroll,
} from "../styles/dialog.ts";

export interface DialogProviderProps extends ak.DialogProviderProps {}

/**
 * @see https://ariakit.com/reference/dialog-provider
 */
export function DialogProvider(props: DialogProviderProps) {
  return <ak.DialogProvider {...props} />;
}

export interface DialogDisclosureProps
  extends ak.DialogDisclosureProps, VariantProps<typeof dialogDisclosure> {}

/**
 * @see https://ariakit.com/reference/dialog-disclosure
 */
export function DialogDisclosure(props: DialogDisclosureProps) {
  const [variantProps, rest] = splitProps(props, dialogDisclosure);
  return (
    <ak.DialogDisclosure {...dialogDisclosure.jsx(variantProps)} {...rest} />
  );
}

export interface DialogProps
  extends ak.DialogProps, VariantProps<typeof dialog> {}

/**
 * @see https://ariakit.com/reference/dialog
 */
export function Dialog(props: DialogProps) {
  const [variantProps, rest] = splitProps(props, dialog);
  // Ariakit communicates the open state through the data-open attribute
  // rather than the native open pseudo state. An explicit $state prop still
  // wins, e.g. "none" for static previews. Ariakit renders its backdrop as
  // a real element, so the styled backdrop comes from the backdrop prop
  // rather than the native ::backdrop channel — but only for modal dialogs,
  // and an explicit backdrop prop in rest still wins.
  return (
    <ak.Dialog
      backdrop={(rest.modal ?? true) && <div {...dialogBackdrop.jsx({})} />}
      {...dialog.jsx({
        ...variantProps,
        $state: variantProps.$state ?? "data",
      })}
      {...rest}
    />
  );
}

export interface DialogHeadingProps
  extends ak.DialogHeadingProps, VariantProps<typeof dialogHeading> {}

/**
 * @see https://ariakit.com/reference/dialog-heading
 */
export function DialogHeading(props: DialogHeadingProps) {
  const [variantProps, rest] = splitProps(props, dialogHeading);
  return <ak.DialogHeading {...dialogHeading.jsx(variantProps)} {...rest} />;
}

export interface DialogDescriptionProps
  extends ak.DialogDescriptionProps, VariantProps<typeof dialogDescription> {}

/**
 * @see https://ariakit.com/reference/dialog-description
 */
export function DialogDescription(props: DialogDescriptionProps) {
  const [variantProps, rest] = splitProps(props, dialogDescription);
  return (
    <ak.DialogDescription {...dialogDescription.jsx(variantProps)} {...rest} />
  );
}

export interface DialogDismissProps
  extends ak.DialogDismissProps, VariantProps<typeof dialogDismiss> {}

/**
 * @see https://ariakit.com/reference/dialog-dismiss
 */
export function DialogDismiss(props: DialogDismissProps) {
  const [variantProps, rest] = splitProps(props, dialogDismiss);
  return <ak.DialogDismiss {...dialogDismiss.jsx(variantProps)} {...rest} />;
}

export interface DialogScrollProps
  extends ComponentProps<"div">, VariantProps<typeof dialogScroll> {}

/**
 * Scrollable viewport that covers the dialog’s content box, for dialogs
 * whose content can outgrow the available height.
 */
export function DialogScroll(props: DialogScrollProps) {
  const [variantProps, rest] = splitProps(props, dialogScroll);
  return <div {...dialogScroll.jsx(variantProps)} {...rest} />;
}
