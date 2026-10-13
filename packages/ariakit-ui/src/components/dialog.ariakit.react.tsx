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
 * Shares open state between a dialog and its disclosure button.
 * @example
 * <DialogProvider>
 *   <DialogDisclosure>View details</DialogDisclosure>
 *   <Dialog aria-label="Project details">
 *     <p>The project is ready.</p>
 *     <DialogDismiss>Close</DialogDismiss>
 *   </Dialog>
 * </DialogProvider>
 */
export function DialogProvider(props: DialogProviderProps) {
  return <ak.DialogProvider {...props} />;
}

export interface DialogDisclosureProps
  extends ak.DialogDisclosureProps, VariantProps<typeof dialogDisclosure> {}

/**
 * Renders a button that opens or closes its dialog.
 * @example
 * <DialogProvider>
 *   <DialogDisclosure>View details</DialogDisclosure>
 *   <Dialog aria-label="Project details">
 *     <p>The project is ready.</p>
 *     <DialogDismiss>Close</DialogDismiss>
 *   </Dialog>
 * </DialogProvider>
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
 * Renders a modal dialog with focus management.
 * @example
 * <DialogProvider>
 *   <DialogDisclosure>View details</DialogDisclosure>
 *   <Dialog aria-label="Project details">
 *     <p>The project is ready.</p>
 *     <DialogDismiss>Close</DialogDismiss>
 *   </Dialog>
 * </DialogProvider>
 */
export function Dialog(props: DialogProps) {
  const [variantProps, rest] = splitProps(props, dialog);
  return <ak.Dialog {...dialog.jsx(variantProps)} {...rest} />;
}

export interface DialogHeadingProps
  extends ak.DialogHeadingProps, VariantProps<typeof dialogHeading> {}

/**
 * Renders a heading that gives its dialog an accessible name.
 * @example
 * <DialogProvider defaultOpen>
 *   <Dialog>
 *     <DialogHeading>Project details</DialogHeading>
 *     <p>The project is ready.</p>
 *   </Dialog>
 * </DialogProvider>
 */
export function DialogHeading(props: DialogHeadingProps) {
  const [variantProps, rest] = splitProps(props, dialogHeading);
  return <ak.DialogHeading {...dialogHeading.jsx(variantProps)} {...rest} />;
}

export interface DialogDescriptionProps
  extends ak.DialogDescriptionProps, VariantProps<typeof dialogDescription> {}

/**
 * Renders text that describes its dialog to assistive technology.
 * @example
 * <DialogProvider defaultOpen>
 *   <Dialog aria-label="Archive project">
 *     <DialogDescription>You can restore it later.</DialogDescription>
 *     <DialogDismiss>Cancel</DialogDismiss>
 *   </Dialog>
 * </DialogProvider>
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
 * Renders a button that closes its dialog. Without children, it shows an icon
 * in a square button named "Dismiss popup".
 * @example
 * <DialogProvider defaultOpen>
 *   <Dialog aria-label="Project details">
 *     <DialogDismiss />
 *     <p>The project is ready.</p>
 *   </Dialog>
 * </DialogProvider>
 */
export function DialogDismiss({ children, ...props }: DialogDismissProps) {
  const [variantProps, rest] = splitProps(props, dialogDismiss);
  // A slot keeps the icon-only button square. Its hidden icon needs a button
  // label.
  const iconOnly = children === undefined;
  const fallbackLabel = iconOnly ? "Dismiss popup" : undefined;
  return (
    <ak.DialogDismiss
      {...dialogDismiss.jsx(variantProps)}
      {...rest}
      // Preserve the fallback when the caller passes undefined.
      aria-label={rest["aria-label"] ?? fallbackLabel}
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
 * Renders a scrollable viewport for long dialog content. Give the dialog a flex
 * column layout so the viewport can shrink within its maximum height.
 * @example
 * <DialogProvider defaultOpen>
 *   <Dialog aria-label="Terms" className="flex flex-col">
 *     <DialogScroll>
 *       <p>Read the terms before you continue.</p>
 *     </DialogScroll>
 *     <DialogDismiss>Close</DialogDismiss>
 *   </Dialog>
 * </DialogProvider>
 */
export function DialogScroll(props: DialogScrollProps) {
  const [variantProps, rest] = splitProps(props, dialogScroll);
  return <div {...dialogScroll.jsx(variantProps)} {...rest} />;
}
