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
 * Floats 8px away from its anchor by default, like `ComboboxPopover` and
 * Ariakit's `Tooltip`. An arrow adds its own offset on top of the gutter.
 * @see https://ariakit.com/reference/popover
 */
export function Popover({ gutter = 8, ...props }: PopoverProps) {
  const [variantProps, rest] = splitProps(props, popover);
  return (
    <ak.Popover gutter={gutter} {...popover.jsx(variantProps)} {...rest} />
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

export interface PopoverDismissProps
  extends ak.PopoverDismissProps, VariantProps<typeof popoverDismiss> {}

/**
 * Without children, renders a square icon button named "Dismiss popup".
 * @see https://ariakit.com/reference/popover-dismiss
 */
export function PopoverDismiss({ children, ...props }: PopoverDismissProps) {
  const [variantProps, rest] = splitProps(props, popoverDismiss);
  // Ariakit's default children is a bare 1em icon, which the button recipe pads
  // like a line of text. A slot makes the icon-only button square, and the name
  // moves to the button because the slot icon is hidden.
  const iconOnly = children === undefined;
  return (
    <ak.PopoverDismiss
      aria-label={iconOnly ? "Dismiss popup" : undefined}
      {...popoverDismiss.jsx(variantProps)}
      {...rest}
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
 * Scrollable viewport that covers the popover’s content box, for popovers whose
 * content can outgrow the available height. Give the popover a height cap and a
 * flex column layout so the viewport can shrink, for example
 * `className="flex flex-col max-h-(--popover-available-height)"`.
 */
export function PopoverScroll(props: PopoverScrollProps) {
  const [variantProps, rest] = splitProps(props, popoverScroll);
  return <div {...popoverScroll.jsx(variantProps)} {...rest} />;
}
