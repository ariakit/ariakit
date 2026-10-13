import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  popover,
  popoverDescription,
  popoverDisclosure,
  popoverDismiss,
  popoverHeading,
  popoverScroll,
} from "../styles/popover.ts";
import { ButtonSlot } from "./button.ariakit.react.tsx";

export interface PopoverProviderProps extends ak.PopoverProviderProps {}

/**
 * Shares open state and anchor position with a popover.
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Details</PopoverDisclosure>
 *   <Popover aria-label="Project details">
 *     <p>The project is ready.</p>
 *   </Popover>
 * </PopoverProvider>
 */
export function PopoverProvider(props: PopoverProviderProps) {
  return <ak.PopoverProvider {...props} />;
}

export interface PopoverDisclosureProps
  extends ak.PopoverDisclosureProps, VariantProps<typeof popoverDisclosure> {}

/**
 * Renders the button that opens and anchors its popover.
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Details</PopoverDisclosure>
 *   <Popover aria-label="Project details">
 *     <p>The project is ready.</p>
 *   </Popover>
 * </PopoverProvider>
 */
export function PopoverDisclosure(props: PopoverDisclosureProps) {
  const [variantProps, rest] = splitProps(props, popoverDisclosure);
  return (
    <ak.PopoverDisclosure {...popoverDisclosure.jsx(variantProps)} {...rest} />
  );
}

export interface PopoverProps
  extends ak.PopoverProps, VariantProps<typeof popover> {}

/**
 * Renders a popup anchored to its disclosure, with an 8px gutter by default. An
 * arrow adds its own offset to the gutter.
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Details</PopoverDisclosure>
 *   <Popover aria-label="Project details">
 *     <p>The project is ready.</p>
 *   </Popover>
 * </PopoverProvider>
 */
export function Popover({ gutter = 8, ...props }: PopoverProps) {
  const [variantProps, rest] = splitProps(props, popover);
  return (
    <ak.Popover gutter={gutter} {...popover.jsx(variantProps)} {...rest} />
  );
}

export interface PopoverArrowProps extends ak.PopoverArrowProps {}

/**
 * Renders an arrow that points from the popover to its anchor.
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Details</PopoverDisclosure>
 *   <Popover aria-label="Project details">
 *     <PopoverArrow />
 *     <p>The project is ready.</p>
 *   </Popover>
 * </PopoverProvider>
 */
export function PopoverArrow(props: PopoverArrowProps) {
  return <ak.PopoverArrow {...props} />;
}

export interface PopoverHeadingProps
  extends ak.PopoverHeadingProps, VariantProps<typeof popoverHeading> {}

/**
 * Renders a heading that gives its popover an accessible name.
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Details</PopoverDisclosure>
 *   <Popover>
 *     <PopoverHeading>Project details</PopoverHeading>
 *     <p>The project is ready.</p>
 *   </Popover>
 * </PopoverProvider>
 */
export function PopoverHeading(props: PopoverHeadingProps) {
  const [variantProps, rest] = splitProps(props, popoverHeading);
  return <ak.PopoverHeading {...popoverHeading.jsx(variantProps)} {...rest} />;
}

export interface PopoverDescriptionProps
  extends ak.PopoverDescriptionProps, VariantProps<typeof popoverDescription> {}

/**
 * Renders text that describes its popover to assistive technology.
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Archive</PopoverDisclosure>
 *   <Popover aria-label="Archive project">
 *     <PopoverDescription>You can restore it later.</PopoverDescription>
 *     <PopoverDismiss>Cancel</PopoverDismiss>
 *   </Popover>
 * </PopoverProvider>
 */
export function PopoverDescription(props: PopoverDescriptionProps) {
  const [variantProps, rest] = splitProps(props, popoverDescription);
  return (
    <ak.PopoverDescription
      {...popoverDescription.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface PopoverDismissProps
  extends ak.PopoverDismissProps, VariantProps<typeof popoverDismiss> {}

/**
 * Renders a button that closes its popover. Without children, it shows an icon
 * in a square button named "Dismiss popup".
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Details</PopoverDisclosure>
 *   <Popover aria-label="Project details">
 *     <PopoverDismiss />
 *     <p>The project is ready.</p>
 *   </Popover>
 * </PopoverProvider>
 */
export function PopoverDismiss({ children, ...props }: PopoverDismissProps) {
  const [variantProps, rest] = splitProps(props, popoverDismiss);
  // A slot keeps the icon-only button square. Its hidden icon needs a button
  // label.
  const iconOnly = children === undefined;
  const fallbackLabel = iconOnly ? "Dismiss popup" : undefined;
  return (
    <ak.PopoverDismiss
      {...popoverDismiss.jsx(variantProps)}
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
    </ak.PopoverDismiss>
  );
}

export interface PopoverScrollProps
  extends ComponentProps<"div">, VariantProps<typeof popoverScroll> {}

/**
 * Renders a scrollable viewport for long popover content. Give the popover a
 * maximum height and a flex column layout so the viewport can shrink.
 * @example
 * <PopoverProvider>
 *   <PopoverDisclosure>Details</PopoverDisclosure>
 *   <Popover
 *     aria-label="Project details"
 *     className="flex flex-col max-h-(--popover-available-height)"
 *   >
 *     <PopoverScroll>
 *       <p>The project is ready.</p>
 *     </PopoverScroll>
 *   </Popover>
 * </PopoverProvider>
 */
export function PopoverScroll(props: PopoverScrollProps) {
  const [variantProps, rest] = splitProps(props, popoverScroll);
  return <div {...popoverScroll.jsx(variantProps)} {...rest} />;
}
