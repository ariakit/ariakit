import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import {
  button,
  buttonActiveIndicator,
  buttonContent,
  buttonDescription,
  buttonGroup,
  buttonLabel,
  buttonSlot,
} from "../styles/button.ts";

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function Button(props: ButtonProps) {
  const [variantProps, rest] = splitProps(props, button);
  const disabled =
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  return (
    <button {...button({ $disabled: disabled, ...variantProps })} {...rest} />
  );
}

export interface ButtonGroupProps
  extends ComponentProps<"div">,
    VariantProps<typeof buttonGroup> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const [variantProps, rest] = splitProps(props, buttonGroup);
  return <div {...buttonGroup(variantProps)} {...rest} />;
}

export interface ButtonContentProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonContent> {}

export interface ButtonActiveIndicatorProps
  extends ComponentProps<"div">,
    VariantProps<typeof buttonActiveIndicator> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonActiveIndicator(props: ButtonActiveIndicatorProps) {
  const [variantProps, rest] = splitProps(props, buttonActiveIndicator);
  return <div {...buttonActiveIndicator(variantProps)} {...rest} />;
}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonContent(props: ButtonContentProps) {
  const [variantProps, rest] = splitProps(props, buttonContent);
  return <span {...buttonContent(variantProps)} {...rest} />;
}

export interface ButtonLabelProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonLabel> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonLabel(props: ButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, buttonLabel);
  return <span {...buttonLabel(variantProps)} {...rest} />;
}

export interface ButtonDescriptionProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonDescription> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonDescription(props: ButtonDescriptionProps) {
  const [variantProps, rest] = splitProps(props, buttonDescription);
  return <span {...buttonDescription(variantProps)} {...rest} />;
}

export interface ButtonSlotProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonSlot> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonSlot(props: ButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, buttonSlot);
  return <span {...buttonSlot(variantProps)} {...rest} />;
}
