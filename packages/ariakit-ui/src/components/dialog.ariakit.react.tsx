import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  dialog,
  dialogDescription,
  dialogDisclosure,
  dialogDismiss,
  dialogHeading,
  dialogScroll,
} from "../styles/dialog.ts";
import { ButtonSlot } from "./button.ariakit.react.tsx";

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
  return <ak.Dialog {...dialog.jsx(variantProps)} {...rest} />;
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
 * Without children, renders a square icon button named "Dismiss popup".
 * @see https://ariakit.com/reference/dialog-dismiss
 */
export function DialogDismiss({ children, ...props }: DialogDismissProps) {
  const [variantProps, rest] = splitProps(props, dialogDismiss);
  // Ariakit's default children is a bare 1em icon, which the button recipe pads
  // like a line of text. A slot makes the icon-only button square, and the name
  // moves to the button because the slot icon is hidden.
  const iconOnly = children === undefined;
  return (
    <ak.DialogDismiss
      aria-label={iconOnly ? "Dismiss popup" : undefined}
      {...dialogDismiss.jsx(variantProps)}
      {...rest}
    >
      {iconOnly ? (
        <ButtonSlot>
          <XIcon />
        </ButtonSlot>
      ) : (
        children
      )}
    </ak.DialogDismiss>
  );
}

export interface DialogScrollProps
  extends ComponentProps<"div">, VariantProps<typeof dialogScroll> {}

/**
 * Scrollable viewport that covers the dialog’s content box, for dialogs whose
 * content can outgrow the available height. Give the dialog a flex column
 * layout so the viewport can shrink below the dialog's height cap, for example
 * `className="flex flex-col"`.
 */
export function DialogScroll(props: DialogScrollProps) {
  const [variantProps, rest] = splitProps(props, dialogScroll);
  return <div {...dialogScroll.jsx(variantProps)} {...rest} />;
}
