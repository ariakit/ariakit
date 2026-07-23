import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import {
  popover,
  popoverDescription,
  popoverDisclosure,
  popoverHeading,
  popoverScroll,
} from "../styles/popover.ts";

export interface PopoverProviderProps extends ak.PopoverProviderProps {}

/**
 * @see https://ariakit.com/reference/popover-provider
 */
export function PopoverProvider(props: PopoverProviderProps) {
  return <ak.PopoverProvider {...props} />;
}

export interface PopoverDisclosureProps
  extends ak.PopoverDisclosureProps, VariantProps<typeof popoverDisclosure> {}

/**
 * @see https://ariakit.com/reference/popover-disclosure
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
 * @see https://ariakit.com/reference/popover
 */
export function Popover(props: PopoverProps) {
  const [variantProps, rest] = splitProps(props, popover);
  // Ariakit communicates the open state through the data-open attribute
  // rather than the native open pseudo state. An explicit $state prop still
  // wins, e.g. "none" for static previews.
  return (
    <ak.Popover
      {...popover.jsx({
        ...variantProps,
        $state: variantProps.$state ?? "data",
      })}
      {...rest}
    />
  );
}

export interface PopoverArrowProps extends ak.PopoverArrowProps {}

/**
 * @see https://ariakit.com/reference/popover-arrow
 */
export function PopoverArrow(props: PopoverArrowProps) {
  return <ak.PopoverArrow {...props} />;
}

export interface PopoverHeadingProps
  extends ak.PopoverHeadingProps, VariantProps<typeof popoverHeading> {}

/**
 * @see https://ariakit.com/reference/popover-heading
 */
export function PopoverHeading(props: PopoverHeadingProps) {
  const [variantProps, rest] = splitProps(props, popoverHeading);
  return <ak.PopoverHeading {...popoverHeading.jsx(variantProps)} {...rest} />;
}

export interface PopoverDescriptionProps
  extends ak.PopoverDescriptionProps, VariantProps<typeof popoverDescription> {}

/**
 * @see https://ariakit.com/reference/popover-description
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

export interface PopoverDismissProps extends ak.PopoverDismissProps {}

/**
 * @see https://ariakit.com/reference/popover-dismiss
 */
export function PopoverDismiss(props: PopoverDismissProps) {
  return <ak.PopoverDismiss {...props} />;
}

export interface PopoverScrollProps
  extends ComponentProps<"div">, VariantProps<typeof popoverScroll> {}

/**
 * Scrollable viewport that covers the popover’s content box, for popovers
 * whose content can outgrow the available height.
 */
export function PopoverScroll(props: PopoverScrollProps) {
  const [variantProps, rest] = splitProps(props, popoverScroll);
  return <div {...popoverScroll.jsx(variantProps)} {...rest} />;
}
